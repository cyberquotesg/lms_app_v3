// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// by rachmad
// import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AfterViewInit, Component, OnInit, ViewChild, Renderer2 } from '@angular/core';

import { IonRouterOutlet } from '@ionic/angular';
import { BackButtonEvent } from '@ionic/core';

import { CoreLoginHelper } from '@features/login/services/login-helper';
import { SplashScreen } from '@singletons';
import { CoreApp } from '@services/app';
import { CoreNavigator } from '@services/navigator';
import { CoreSubscriptions } from '@singletons/subscriptions';
import { CoreWindow } from '@singletons/window';
import { CoreUtils } from '@services/utils/utils';
import { CorePlatform } from '@services/platform';
import { CoreLogger } from '@singletons/logger';
import { CorePromisedValue } from '@classes/promised-value';
import { register } from 'swiper/element/bundle';

// by rachmad
import { CoreEvents } from '@singletons/events';
import { CqHelper } from '@features/cq_pages/services/cq_helper';
import { Zoom } from '@awesome-cordova-plugins/zoom';
import Color from 'color';
import { AddonNotifications } from '@addons/notifications/services/notifications';

register();

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild(IonRouterOutlet) outlet?: IonRouterOutlet;

    protected logger = CoreLogger.getInstance('AppComponent');

    // by rachmad
    notificationAnnouncementCountAgent: any;

    // by rachmad
    constructor(protected renderer: Renderer2, protected CH: CqHelper)
    {
        this.CH.zoom = Zoom;
    }

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = <any> window;

        CorePlatform.resume.subscribe(() => {
            // Wait a second before setting it to false since in iOS there could be some frozen WS calls.
            setTimeout(() => {
                if (CoreLoginHelper.isWaitingForBrowser() && !CoreUtils.isInAppBrowserOpen()) {
                    CoreLoginHelper.stopWaitingForBrowser();
                    CoreLoginHelper.checkLogout();
                }
            }, 1000);
        });

        // "Expose" CoreWindow.open.
        win.openWindowSafely = (url: string, name?: string): void => {
            CoreWindow.open(url, name);
        };

        // Treat URLs that try to override the app.
        win.onOverrideUrlLoading = (url: string) => {
            CoreWindow.open(url);
        };

        // Quit app with back button.
        document.addEventListener('ionBackButton', (event: BackButtonEvent) => {
            // This callback should have the lowest priority in the app.
            event.detail.register(-100, async () => {
                const initialPath = CoreNavigator.getCurrentPath();
                if (initialPath.startsWith('/main/')) {
                    // Main menu has its own callback to handle back. If this callback is called it means we should exit app.
                    CoreApp.closeApp();

                    return;
                }

                // This callback can be called at the same time as Ionic's back navigation callback.
                // Check if the path changes due to the back navigation handler, to know if we're at root level.
                // Ionic doc recommends IonRouterOutlet.canGoBack, but there's no easy way to get the current outlet from here.
                // The path seems to change immediately (0 ms timeout), but use 50ms just in case.
                await CoreUtils.wait(50);

                if (CoreNavigator.getCurrentPath() != initialPath) {
                    // Ionic has navigated back, nothing else to do.
                    return;
                }

                // Quit the app.
                CoreApp.closeApp();
            });
        });

        // @todo Pause Youtube videos in Android when app is put in background or screen is locked?
        // See: https://github.com/moodlehq/moodleapp/blob/ionic3/src/app/app.component.ts#L312

        // by rachmad
        CoreEvents.on(CoreEvents.LOGOUT, () => {
            this.ifLoggedOut();
        });
        CoreEvents.on(CoreEvents.LOGIN, () => {
            this.ifLoggedOut();
            this.ifLoggedIn();
        });
        CoreEvents.on(CoreEvents.SESSION_EXPIRED, () => {
            this.ifLoggedOut();
        });
        CoreEvents.on(CoreEvents.USER_NO_LOGIN, () => {
            this.ifLoggedOut();
        });
    }

    /**
     * @inheritdoc
     */
    ngAfterViewInit(): void {
        if (!this.outlet) {
            return;
        }

        this.logger.debug('App component initialized');

        CoreSubscriptions.once(this.outlet.activateEvents, async () => {
            await CorePlatform.ready();

            this.logger.debug('Hide splash screen');
            SplashScreen.hide();
            this.setSystemUIColorsAfterSplash();
        });
    }

    /**
     * Set the system UI Colors after hiding the splash to ensure it's correct.
     *
     * @returns Promise resolved when done.
     */
    protected async setSystemUIColorsAfterSplash(): Promise<void> {
        // When the app starts and the splash is hidden, the color of the bars changes from transparent to black.
        // We have to set the current color but we don't know when the change will be made.
        // This problem is only related to Android, so on iOS it will be only set once.
        if (!CorePlatform.isAndroid()) {
            CoreApp.setSystemUIColors();

            return;
        }

        const promise = new CorePromisedValue<void>();

        const interval = window.setInterval(() => {
            CoreApp.setSystemUIColors();
        });
        setTimeout(() => {
            clearInterval(interval);
            promise.resolve();

        }, 1000);

        return promise;
    }

    // by rachmad
    ifLoggedIn(): void {
        this.CH.updateCount("notification, announcement");
        this.notificationAnnouncementCountAgent = setInterval(() => { this.CH.updateCount("notification, announcement") }, 10 * 1000);

        const institutionParams: any = {
            calls: {
                country: {
                    cluster: "CqInstitutionLib",
                    endpoint: "get_country_by_user",
                },
                organization: {
                    cluster: "CqInstitutionLib",
                    endpoint: "get_organization_by_user",
                },
            },
        };
        this.CH.callApi(institutionParams)
        .then((data) => {
            let allData = this.CH.toJson(data);
            this.CH.log("country data", allData.country);
            this.CH.log("organization data", allData.organization);

            let country = allData.country ? JSON.stringify(allData.country) : "{}";
            let organization = allData.organization ? JSON.stringify(allData.organization) : "{}";

            localStorage.setItem('cqCountry', country);
            localStorage.setItem('cqOrganization', organization);

            // Set cssVars
            if (allData.organization)
            {
                const properties = [
                    'headerBackgroundColor',
                    'headerTextColor',
                    'footerBackgroundColor',
                    'footerTextColor',
                    'menuBackgroundColor',
                    'menuTextColor',
                    'selectedMenuBackgroundColor',
                    'selectedMenuTextColor',
                    'selectedMenuHoverBackgroundColor',
                    'selectedMenuHoverTextColor',
                    'buttonColor',
                    'buttonBorderColor',
                    'buttonTextColor',
                    'buttonHoverColor',
                    'buttonHoverBorderColor',
                    'buttonHoverTextColor',
                    'mobileBackgroundColor',
                    'mobileBackgroundImage',
                ];
                let cssVars: string[] = [];
                properties.forEach((property) => {
                    if (this.CH.isEmpty(allData.organization[property]) || allData.organization[property] == 'null') return;

                    let cssVar = '';

                    // color
                    if (property.toLowerCase().indexOf("color") > -1)
                    {
                        cssVar = '--' + property + ': #' + allData.organization[property] + ";";
                        cssVar += '--' + property.replace("Color", "LightenColor") + ': ' + Color('#' + allData.organization[property]).lighten(0.4).hex() + ";";
                        cssVar += '--' + property.replace("Color", "DarkenColor") + ': ' + Color('#' + allData.organization[property]).darken(0.4).hex() + ";";
                        cssVar += '--' + property.replace("Color", "LeftenColor") + ': ' + Color('#' + allData.organization[property]).rotate(-15).hex() + ";";
                        cssVar += '--' + property.replace("Color", "RightenColor") + ': ' + Color('#' + allData.organization[property]).rotate(15).hex();
                    }

                    // image
                    else if (property == 'mobileBackgroundImage')
                    {
                        cssVar = '--' + property + ': url(\'/assets/img/background/' + allData.organization[property] + '\')';
                    }

                    // anything else
                    else cssVar = '--' + property + ': ' + allData.organization[property];

                    // this.log('cssVar', cssVar);
                    cssVars.push(cssVar);
                });

                this.renderer.addClass(this.CH.getBody(), 'logged-in');
                this.renderer.setProperty(this.CH.getBody(), 'style', cssVars.join(';'));
            }
        })
        .catch((error) => {
            this.CH.errorLog("institution information error", {institutionParams, error});
        });

        // zoom
        this.CH.initiateZoom();
    }
    ifLoggedOut(): void {
        clearInterval(this.notificationAnnouncementCountAgent);

        this.renderer.removeClass(this.CH.getBody(), 'logged-in');
        this.renderer.setProperty(this.CH.getBody(), 'style', '');

        this.CH.zoomInitiated = false;
    }
}
