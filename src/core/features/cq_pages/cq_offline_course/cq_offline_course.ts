// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CoreUtils } from '@services/utils/utils';
import { ChartData } from 'chart.js';

@Component({
    selector: 'cq_offline_course',
    templateUrl: './cq_offline_course.html',
    styles: ['./cq_offline_course.scss'],
})
export class CqOfflineCourse extends CqPage implements OnInit
{
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams: any = {
        courseId: 0,
        courseName: '',
    };
    pageDefaults: any = {
        course: {},
        sessions: [],
        isIos: false,
    };
    pageJob: any = {
        course: 0,
    };

    private agent: any;
    private loading: any = false;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform)
    {
        super(renderer, CH);
        this.pageData.isIos = platform.is('ios');
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    course(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqCourseLib',
            function: 'view_classroom_training',
            course_id: this.pageParams.courseId,
        };
        this.pageJobExecuter(jobName, params, (data) => {
            data = this.CH.toJson(data);

            this.pageData.course = data.ctData;
            this.pageData.course.venue = this.pageData.course.venue ? this.pageData.course.venue : '-';

            if (this.pageData.course.isUserFinished && this.pageData.course.isUserFinished == '1')
            {
                this.pageData.course.showEnrolled = false;
                this.pageData.course.showFinished = true;
            }
            else
            {
                this.pageData.course.showEnrolled = this.pageData.course.isUserEnrolled && this.pageData.course.isUserEnrolled == '1';
                this.pageData.course.showFinished = false;
            }

            this.pageData.sessions = this.CH.toArray(data.ctSessionData);
            this.pageData.sessions.map((session) => {
                let tempDateTime: string[] = [];
                session.fullDateTimeText.forEach((dateTime: any) => {
                    let temp: string = this.CH.time24To12Batch(dateTime);
                    tempDateTime.push(temp);
                });

                session.fullDateTimeTextCombined = tempDateTime.join(', ');
                session.availableSeat = Number(session.capacity) - Number(session.enrolledCount);
                session.willStartInDegradated = session.willStartIn;
            });

            this.agent = setInterval(() => {
                this.pageData.sessions.map((session) => {
                    session.willStartInDegradated--;
                });
            }, 1000);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    connectSession(purpose: string, sessionId: number): void
    {
        this.loading = true;
        this.CH.loading('Please wait...', (loading) => {
            const params: any = {
                class: 'CqCourseLib',
                function: purpose + '_classroom_training',
                session_id: sessionId,
            };
            this.CH.callApi(params)
            .then((data) => {
                data = this.CH.toJson(data);
                this.CH.log('sign up result', data);

                // sign up or withdraw is successfull
                if ((purpose == 'sign_up' && Number(data.userEnrolment)) || (purpose == 'withdraw' && !Number(data.userEnrolment)))
                {
                    this.pageForceReferesh(() => {
                        this.loading = false;
                        loading.dismiss();

                        // success to enrol and gather new data
                        if (data.success == 1) this.CH.alert('Success!', data.message);

                        // failed to enrol but success to gather new data
                        else this.CH.alert('Ups!', data.message);
                    });
                }

                // sign up or withdraw is failed
                else
                {
                    this.loading = false;
                    loading.dismiss();
                    this.CH.alert('Ups!', data.message)
                }
            })
            .catch(() => {
                this.loading = false;
                loading.dismiss();
                
                // cannot sign up because server is unreachable
                this.CH.alert('Ups!', 'Server is unreachable, please check your internet connection');
            })
            .finally(() => {
            });
        });
    }
    takeSession(sessionId: number): void
    {
        this.connectSession('sign_up', sessionId);
    }
    leaveSession(sessionId: number): void
    {
        this.CH.alert('Confirm!', 'Are you sure to withdraw from this course?', {
            text: 'Sure',
            role: 'sure',
            handler: (): void => {
                this.connectSession('withdraw', sessionId);
            }
        }, {
            text: 'Cancel',
            role: 'cancel',
            handler: (): void => {
            }
        });
    }















    scanQRCodeEngine(latitude?: number, longitude?: number): void
    {
        CoreUtils.scanQR().then((QRCodeData: any) => {
            if (this.CH.isEmpty(QRCodeData)) return;
            
            let data = this.CH.readQRCode(QRCodeData);
            let params = {
                identifier: data[0],
                type: data[1],
                course_id: this.pageData.course.id,
                latitude: (latitude ? latitude : '[empty]'),
                longitude: (longitude ? longitude : '[empty]'),
            };

            this.CH.loading('Please wait...', (loading) => {
                /* *a/
                this.CH.callCustomApi('local_classroom_training_checklog', params)
                .then((response) => {
                    let result = this.CH.toJson(response);

                    if (result.success)
                    {
                        this.refreshCourse(loading, () => {
                            // warning! must be using beautiful dedicated page
                            // this.CH.alert('Success!', 'You have checked ' + result.type);
                            
                            this.showChecklogBanner(result);
                        }, () => {
                            this.CH.alert('Notice!', 'You have checked ' + result.type + ', please refresh (pull down) the page.');
                        });
                    }
                    else
                    {
                        loading.dismiss();
                        this.CH.alert('Ups!', result.message);
                    }
                })
                .catch((e) => {
                    loading.dismiss();
                    
                    // cannot sign up because server is unreachable
                    this.CH.alert('Ups!', 'Server is unreachable, please check your internet connection');
                })
                .finally(() => {
                });
                /* */
            });
        });
    }
    scanQRCode(venueCheck: number): void
    {
        if (venueCheck == 1)
        {
            navigator.geolocation.getCurrentPosition((position) => {
                this.scanQRCodeEngine(position.coords.latitude, position.coords.longitude);
            }, (e) => {
                this.CH.alert('Ups!', 'Cannot get location data, make sure your GPS is turned on and try again');
            }, {
                enableHighAccuracy: true, 
                maximumAge: 11000, 
                timeout: 10000,
            });
        }
        else this.scanQRCodeEngine();
    }

    /* for testing purpose */
    showChecklogBannerTemp(type: number): void
    {
        let data: any;
        this.CH.log('showChecklogBannerTemp', type);

        if (type == 1)
        {
            data = {
                success: true,
                code: 'checked_in',
                message: 'You have successfully checked in',
                type: 'in',
                time: '9.12 am',
                name: 'course name',
            };
        }
        else if (type == 2)
        {
            data = {
                success: true,
                code: 'checked_out',
                message: 'You have successfully checked out',
                type: 'out',
                time: '9.52 am',
                name: 'course name',
            };
        }

        this.CH.log('having data', data);
        this.showChecklogBanner(data);
    }
    /* for testing purpose */
    
    showChecklogBanner(data: any): void
    {
        const stateParams: any = {
            data: JSON.stringify(data),
        };
        CoreNavigator.navigateToSitePath('/CqOfflineCourse/banner', {
            params: stateParams,
            siteId: this.CH.getSiteId(),
            preferCurrentTab: false,
        });
    }

    alertZoomNotStarted(date: any): void
    {
        this.CH.alert(
            'Ups!',
            'Zoom meeting hasn\'t started. ' +
            'It will be available at ' + 
            date.date_text + ' ' + 
            this.CH.time24To12(
                this.CH.timeRemoveSeconds(date.start_time)
            ) + '.'
        );
    }
}