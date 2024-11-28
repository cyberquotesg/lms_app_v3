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

<<<<<<< HEAD
// by rachmad
import { CqHelper } from '@features/cq_pages/services/cq_helper';
import { Zoom } from '@awesome-cordova-plugins/zoom';
import Color from 'color';
import { AddonNotifications } from '@addons/notifications/services/notifications';

const MOODLE_VERSION_PREFIX = 'version-';
const MOODLEAPP_VERSION_PREFIX = 'moodleapp-';
=======
register();
>>>>>>> latest

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild(IonRouterOutlet) outlet?: IonRouterOutlet;

<<<<<<< HEAD
    // by rachmad
    notificationAnnouncementCountAgent: any;

    // by rachmad
    constructor(protected renderer: Renderer2, protected CH: CqHelper)
    {
        this.CH.zoom = Zoom;
    }
=======
    protected logger = CoreLogger.getInstance('AppComponent');
>>>>>>> latest

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = <any> window;
<<<<<<< HEAD
        CoreDomUtils.toggleModeClass('ionic5', true);
        this.addVersionClass(MOODLEAPP_VERSION_PREFIX, CoreConstants.CONFIG.versionname.replace('-dev', ''));

        CoreEvents.on(CoreEvents.LOGOUT, async () => {
            // Unload lang custom strings.
            CoreLang.clearCustomStrings();

            // Remove version classes from body.
            this.removeVersionClass(MOODLE_VERSION_PREFIX);

            // Go to sites page when user is logged out.
            await CoreNavigator.navigate('/login/sites', { reset: true });

            if (CoreSitePlugins.hasSitePluginsLoaded) {
                // Temporary fix. Reload the page to unload all plugins.
                window.location.reload();
            }

            // by rachmad
            this.ifLoggedOut();
        });

        // Listen to scroll to add style when scroll is not 0.
        win.addEventListener('ionScroll', async ({ detail, target }: CustomEvent<ScrollDetail>) => {
            if ((target as HTMLElement).tagName != 'ION-CONTENT') {
                return;
            }
            const content = (target as HTMLIonContentElement);

            const page = content.closest('.ion-page');
            if (!page) {
                return;
            }

            page.querySelector<HTMLIonHeaderElement>('ion-header')?.classList.toggle('core-header-shadow', detail.scrollTop > 0);

            const scrollElement = await content.getScrollElement();
            content.classList.toggle('core-footer-shadow', !CoreDom.scrollIsBottom(scrollElement));
        });
=======
>>>>>>> latest

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

<<<<<<< HEAD
        CoreEvents.on(CoreEvents.LOGIN, async (data) => {
            if (data.siteId) {
                const site = await CoreSites.getSite(data.siteId);
                const info = site.getInfo();
                if (info) {
                    // Add version classes to body.
                    this.removeVersionClass(MOODLE_VERSION_PREFIX);
                    this.addVersionClass(MOODLE_VERSION_PREFIX, CoreSites.getReleaseNumber(info.release || ''));
                }
            }

            this.loadCustomStrings();

            // by rachmad
            this.ifLoggedOut();
            this.ifLoggedIn();
        });

        CoreEvents.on(CoreEvents.SITE_UPDATED, (data) => {
            if (data.siteId == CoreSites.getCurrentSiteId()) {
                this.loadCustomStrings();

                // Add version classes to body.
                this.removeVersionClass(MOODLE_VERSION_PREFIX);
                this.addVersionClass(MOODLE_VERSION_PREFIX, CoreSites.getReleaseNumber(data.release || ''));
            }
        });

        CoreEvents.on(CoreEvents.SITE_ADDED, (data) => {
            if (data.siteId == CoreSites.getCurrentSiteId()) {
                this.loadCustomStrings();

                // Add version classes to body.
                this.removeVersionClass(MOODLE_VERSION_PREFIX);
                this.addVersionClass(MOODLE_VERSION_PREFIX, CoreSites.getReleaseNumber(data.release || ''));
            }
        });

        // by rachmad
        CoreEvents.on(CoreEvents.SESSION_EXPIRED, (data) => {
            this.ifLoggedOut();
        });
        CoreEvents.on(CoreEvents.USER_NO_LOGIN, (data) => {
            this.ifLoggedOut();
        });

        this.onPlatformReady();

=======
>>>>>>> latest
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
    }

    /**
     * @inheritdoc
     */
    ngAfterViewInit(): void {
        if (!this.outlet) {
            return;
        }

        this.logger.debug('App component initialized');

<<<<<<< HEAD
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

    /**
     * Async init function on platform ready.
     */
    protected async onPlatformReady(): Promise<void> {
        await CorePlatform.ready();

        // Refresh online status when changes.
        CoreNetwork.onChange().subscribe(() => {
            // Execute the callback in the Angular zone, so change detection doesn't stop working.
            NgZone.run(() => {
                const isOnline = CoreNetwork.isOnline();
                const hadOfflineMessage = CoreDomUtils.hasModeClass('core-offline');
=======
        CoreSubscriptions.once(this.outlet.activateEvents, async () => {
            await CorePlatform.ready();
>>>>>>> latest

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

}
