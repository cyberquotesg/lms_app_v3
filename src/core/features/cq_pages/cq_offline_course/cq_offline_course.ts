// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';

@Component({
    selector: 'cq_offline_course',
    templateUrl: './cq_offline_course.html',
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
                this.CH.alert('Ups!', data.message)
            }
        })
        .catch(() => {
            this.loading = false;
            
            // cannot sign up because server is unreachable
            this.CH.alert('Ups!', 'Server is unreachable, please check your internet connection');
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

    alertZoomNotStarted(date: any): void
    {
        this.CH.alert(
            'Ups!',
            'Zoom meeting hasn\'t started. ' +
            'It will be available at ' + 
            date.dateText + ' ' + 
            this.CH.time24To12(
                this.CH.timeRemoveSeconds(date.startTime)
            ) + '.'
        );
    }

    timeHasCome(data: any, index: number): void
    {
        this.pageData.sessions[index].willStartInDegradated = 0;
    }

    QRCodeScanner(session: any, latitude?: number, longitude?: number): void
    {
        CoreUtils.scanQR().then((QRCodeData: any) => {
            if (!this.CH.isEmpty(QRCodeData)) this.QRCodeSender(session, QRCodeData, latitude, longitude);
        });
    }
    QRCodeSender(session: any, QRCodeData: string, latitude?: number, longitude?: number)
    {
        let data = this.CH.readQRCode(QRCodeData);
        this.CH.loading('Please wait...', (loading) => {
            const params: any = {
                class: 'CqCourseLib',
                function: 'checklog_classroom_training',
                identifier: data[0],
                type: data[1],
                course_id: this.pageData.course.id,
                session_id: session.id,
                latitude: (latitude ? latitude : '[empty]'),
                longitude: (longitude ? longitude : '[empty]'),
            };
            this.CH.callApi(params)
            .then((data) => {
                data = this.CH.toJson(data);

                this.pageForceReferesh(() => {
                    loading.dismiss();
                    if (data.success) this.showChecklogBanner(data);
                    else this.CH.alert('Ups!', data.message);
                });
            })
            .catch((e) => {
                loading.dismiss();
                
                // cannot sign up because server is unreachable
                this.CH.alert('Ups!', 'Server is unreachable, please check your internet connection');
            })
            .finally(() => {
            });
        });
    }
    scanQRCode(session: any): void
    {
        if (session.venueCheck == 1)
        {
            navigator.geolocation.getCurrentPosition((position) => {
                this.QRCodeScanner(session, position.coords.latitude, position.coords.longitude);
            }, (e) => {
                this.CH.alert('Ups!', 'Cannot get location data, make sure your GPS is turned on and try again');
            }, {
                enableHighAccuracy: true, 
                maximumAge: 11000, 
                timeout: 10000,
            });
        }
        else this.QRCodeScanner(session);
    }
    fakeQRCode(session: any): void
    {
        let fakeQRCodeData = "date_1664359036556_5711206634|date_in";

        if (session.venueCheck == 1)
        {
            navigator.geolocation.getCurrentPosition((position) => {
                this.QRCodeSender(session, fakeQRCodeData, position.coords.latitude, position.coords.longitude)
            }, (e) => {
                this.CH.alert('Ups!', 'Cannot get location data, make sure your GPS is turned on and try again');
            }, {
                enableHighAccuracy: true, 
                maximumAge: 11000, 
                timeout: 10000,
            });
        }
        else this.QRCodeSender(session, fakeQRCodeData);
    }
    showChecklogBanner(data: any): void
    {
        this.CH.modal(CqChecklogBannerComponent, {
            code: data.code,
            type: data.type,
            time: data.time,
            name: data.name,
            message: data.message,
        });
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
                type: 'in',
                time: '9.12 am',
                name: 'my course name',
                message: 'You have successfully checked in',
            };
        }
        else if (type == 2)
        {
            data = {
                success: true,
                code: 'checked_out',
                type: 'out',
                time: '9.52 am',
                name: 'my course name',
                message: 'You have successfully checked out',
            };
        }

        this.CH.log('having data', data);
        this.showChecklogBanner(data);
    }

    async joinMeetingZoom(meetingNumber, meetingPassword): Promise<void> {
        let userId = this.CH.getUserId();
        let userFullname = await this.CH.getUser().getUserFullNameWithDefault(userId);

        if (this.CH.zoomInitiated) this.CH.joinMeetingZoom(meetingNumber, meetingPassword, userFullname);
        else
        {
            const zoomKeysParams = {
                class: "CqLib",
                function: "get_zoom_keys",
            };

            this.CH.callApi(zoomKeysParams).then(async (data) => {
                let jsonData = this.CH.toJson(data);
                if (jsonData.success)
                {
                    let initiated = false;
                    for (let key of jsonData.list)
                    {
                        initiated = await this.CH.initiateZoom(key.apiKey, key.secretKey);
                        if (initiated) break;
                    }

                    if (!initiated)
                    {
                        this.CH.alert("Oops!", "Connection to Zoom was failed, please check your internet connection or contact your course administrator.");
                    }
                    else
                    {
                        this.CH.joinMeetingZoom(meetingNumber, meetingPassword, userFullname);
                    }
                }
                else
                {
                    this.CH.alert("Oops!", "Your organization is not connected to zoom, please contact your course administrator.");
                }
            });
        }
    }
}
