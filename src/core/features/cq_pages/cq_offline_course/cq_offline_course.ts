// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';
import zoomClass from '@zoomus/websdk/embedded'

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
    private platform: any;
    private zoomAgent: any;
    private zoomAgentInitted: boolean = false;
    loading: any = false;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform)
    {
        super(renderer, CH);
        this.platform = platform;
    }

    ngOnInit(): void {
        this.usuallyOnInit(() => {
            this.pageData.isIos = this.platform.is('ios');
        });
    }
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
            this.pageData.sessions = this.CH.toArray(data.ctSessionData).reverse();
            this.pageData.sessions.map((session) => {
                let tempDateTime: string[] = [];
                session.fullDateTimeText.forEach((dateTime: any) => {
                    let temp: string = this.CH.time24To12Batch(dateTime);
                    tempDateTime.push(temp);
                });

                session.fullDateTimeTextCombined = tempDateTime.join(', ');
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
                    else this.CH.alert('Oops!', data.message);
                });
            }

            // sign up or withdraw is failed
            else
            {
                this.loading = false;
                this.CH.alert('Oops!', data.message)
            }
        })
        .catch((error) => {
            this.loading = false;
            
            // cannot sign up because server is unreachable
            this.CH.errorLog("enrolment error", {courseId: this.pageData.course.id, sessionId, media: "offline", purpose, error});
            this.CH.alert('Oops!', 'Server is unreachable, please check your internet connection');
        });
    }
    takeSession(session: any): void
    {
        this.connectSession('sign_up', session.id);
    }
    leaveSession(session: any): void
    {
        let confirmationText = "";
        let closeRegistrationTime = (new Date(session.closeRegistration)).getTime();
        let currentTime = (new Date()).getTime();
        let timeDifference = closeRegistrationTime - currentTime;

        if (timeDifference <= 0)
        {
            confirmationText += "Registration Period has ended at " + session.closeRegistrationText + ". ";
            confirmationText += "Once withdrawn, you will not be able to enrol to this course again.";
            confirmationText += "<br /><br />";
        }
        else if (timeDifference <= (1000 * 60 * 60 * 24))
        {
            confirmationText += "Registration Period will end in less than one day. ";
            confirmationText += "Once withdrawn, you will still be able to enrol to this course again until " + session.closeRegistrationText + ".";
            confirmationText += "<br /><br />";
        }

        confirmationText += "Are you sure to withdraw from this course?";

        this.CH.alert('Confirm!', confirmationText, {
            text: 'Sure',
            role: 'sure',
            handler: (): void => {
                this.connectSession('withdraw', session.id);
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
            'Oops!',
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
                    else this.CH.alert('Oops!', data.message);
                });
            })
            .catch((error) => {
                loading.dismiss();
                
                // cannot sign up because server is unreachable
                this.CH.errorLog("checklog error", {courseId: this.pageData.course.id, sessionId: session.id, media: "offline", QRCodeData, latitude, longitude, error});
                this.CH.alert('Oops!', 'Server is unreachable, please check your internet connection');
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
                this.CH.alert('Oops!', 'Cannot get location data, make sure your GPS is turned on and try again');
            }, {
                enableHighAccuracy: true, 
                maximumAge: 11000, 
                timeout: 10000,
            });
        }
        else this.QRCodeScanner(session);
    }
    fakeScanQRCode(session: any, checklog: any): void
    {
        let fakeQRCodeData = checklog.identifier + "|" + checklog.type;

        if (session.venueCheck == 1)
        {
            navigator.geolocation.getCurrentPosition((position) => {
                this.QRCodeSender(session, fakeQRCodeData, position.coords.latitude, position.coords.longitude)
            }, (e) => {
                this.CH.alert('Oops!', 'Cannot get location data, make sure your GPS is turned on and try again');
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

    openMap(session: any): void
    {
        let url = this.pageData.isIos ? "http://maps.apple.com/?z=10&sll=" : "https://www.google.com/maps/search/?api=1&query=";
        url += session.latitude + "," + session.longitude;

        this.openInBrowser(url);
    }

    async joinMeetingZoom(meetingNumber, meetingPassword): Promise<void>
    {
        let userId = this.CH.getUserId();
        let userFullname = await this.CH.getUser().getUserFullNameWithDefault(userId);
        let userEmail = (await this.CH.getUser().getProfile(userId)).email;

        if (!userEmail)
        {
            this.CH.alert('Oops!', "It seems you haven't provided correct user email, please contact course administrator");
            this.CH.errorLog("zoom error", "user email is not provided");
            return;
        }

        this.CH.joinMeetingZoom(meetingNumber, meetingPassword, userFullname + " (" + userEmail + ")");
    }

    showRejectedReason(message?: string): void
    {
        if (!this.CH.isEmpty(message) && typeof message != "undefined") this.CH.alert('Info!', message);
    }

    joinMeetingZoomWeb(meetingNumber, meetingPassword): void
    {
        this.CH.loading('Please wait...', async (loading) => {
            if (!this.zoomAgentInitted)
            {
                this.zoomAgent = zoomClass.createClient();
                this.zoomAgent.init({
                    zoomAppRoot: document.getElementById('zoomElement'),
                    language: 'en-US',
                });
                this.zoomAgentInitted = true;
            }

            let userId = this.CH.getUserId();
            let userFullname = await this.CH.getUser().getUserFullNameWithDefault(userId);
            let userEmail = (await this.CH.getUser().getProfile(userId)).email;

            if (!userEmail)
            {
                loading.dismiss();
                this.CH.alert('Oops!', "It seems you haven't provided correct user email, please contact course administrator");
                this.CH.errorLog("zoom error", "user email is not provided");
                return;
            }

            const params: any = {
                class: 'CqLib',
                function: 'get_zoom_jwt',
                meeting_number: meetingNumber,
            };
            this.CH.callApi(params)
            .then((data) => {
                data = this.CH.toJson(data);

                let zoomParams = {
                    sdkKey: data.sdkKey,
                    signature: data.jwt,
                    meetingNumber: meetingNumber,
                    userName: userFullname,
                    userEmail: userEmail,
                    password: meetingPassword,
                    role: 0,
                };
                this.CH.log("starting zoom", zoomParams);
                this.zoomAgent.join(zoomParams)
                .then((success) => {
                    loading.dismiss();
                    this.CH.log("zoom started", success);
                })
                .catch((error) => {
                    loading.dismiss();
                    if (error.errorCode == 3008) this.CH.alert('Oops!', error.reason);
                    else
                    {
                        this.CH.alert('Oops!', "Unexpected error occurred, please try again or contact course administrator");
                        this.CH.errorLog("zoom error", error);
                    }
                });
            })
            .catch((error) => {
                loading.dismiss();
                this.CH.alert('Oops!', 'Server is unreachable, please check your internet connection');
                this.CH.errorLog("zoom error", error);
            });
        });
    }
}
