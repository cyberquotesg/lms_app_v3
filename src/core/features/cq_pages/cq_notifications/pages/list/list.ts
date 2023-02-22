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

import { AfterViewInit, Component, OnDestroy, ViewChild, Renderer2 } from '@angular/core';
import { IonRefresher, IonSlides, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CoreDomUtils } from '@services/utils/dom';
import { CoreUtils } from '@services/utils/utils';
import { CoreEventObserver, CoreEvents } from '@singletons/events';
import {
    AddonNotifications, AddonNotificationsProvider,
} from '../../services/notifications';
import { CoreNavigator } from '@services/navigator';
import { CoreSplitViewComponent } from '@components/split-view/split-view';
import { CoreRoutedItemsManagerSourcesTracker } from '@classes/items-management/routed-items-manager-sources-tracker';
import { CorePushNotificationsDelegate } from '@features/pushnotifications/services/push-delegate';
import { CoreSites } from '@services/sites';
import { CoreMainMenuDeepLinkManager } from '@features/mainmenu/classes/deep-link-manager';
import { CoreTimeUtils } from '@services/utils/time';
import { AddonNotificationsNotificationsSource } from '@features/cq_pages/cq_notifications/classes/notifications-source';
import { CoreListItemsManager } from '@classes/items-management/list-items-manager';
import { AddonNotificationsNotificationToRender } from '@features/cq_pages/cq_notifications/services/notifications-helper';
import { AddonLegacyNotificationsNotificationsSource } from '@features/cq_pages/cq_notifications/classes/legacy-notifications-source';

import { CqHelper } from '../../../services/cq_helper';

/**
 * Page that displays the list of notifications.
 */
@Component({
    selector: 'page-addon-notifications-list',
    templateUrl: 'list.html',
    styleUrls: ['list.scss', '../../notifications.scss'],
})
export class AddonNotificationsListPage implements AfterViewInit, OnDestroy {

    @ViewChild(CoreSplitViewComponent) splitView!: CoreSplitViewComponent;
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    notifications!: CoreListItemsManager<AddonNotificationsNotificationToRender, AddonNotificationsNotificationsSource>;
    fetchMoreNotificationsFailed = false;
    canMarkAllNotificationsAsRead = false;
    loadingMarkAllNotificationsAsRead = false;

    subject: string = "Notification";
    selectedOne: string = "notification";
    pageSliderOptions: any = {
        initialSlide: 0,
        speed: 400,
        centerInsufficientSlides: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        slidesPerView: 1,
    };

    notificationList: any[] = [];
    notificationIsLoading = false;

    announcementPage = 1;
    announcementLoaded = false;
    announcementList: any[] = [];
    announcementIsLoading = false;
    announcementReachedEndOfList = false;
    announcementMarkingAllAsReadLoading = false;

    protected isCurrentView?: boolean;
    protected cronObserver?: CoreEventObserver;
    protected readObserver?: CoreEventObserver;
    protected pushObserver?: Subscription;
    protected pendingRefresh = false;

    constructor(protected CH: CqHelper) {
        try {
            const source = CoreRoutedItemsManagerSourcesTracker.getOrCreateSource(
                CoreSites.getRequiredCurrentSite().isVersionGreaterEqualThan('4.0')
                    ? AddonNotificationsNotificationsSource
                    : AddonLegacyNotificationsNotificationsSource,
                [],
            );

            this.notifications = new CoreListItemsManager(source, AddonNotificationsListPage);
        } catch(error) {
            CoreDomUtils.showErrorModal(error);
            CoreNavigator.back();
        }

        this.loadAnnouncements();
    }

    /**
     * @inheritdoc
     */
    async ngAfterViewInit(): Promise<void> {
        await this.fetchInitialNotifications();

        this.notifications.start(this.splitView);

        this.cronObserver = CoreEvents.on(AddonNotificationsProvider.READ_CRON_EVENT, () => {
            if (!this.isCurrentView) {
                return;
            }

            this.refreshNotifications();
        }, CoreSites.getCurrentSiteId());

        this.pushObserver = CorePushNotificationsDelegate.on('receive').subscribe((notification) => {
            // New notification received. If it's from current site, refresh the data.
            if (!this.isCurrentView) {
                this.pendingRefresh = true;

                return;
            }

            if (!CoreUtils.isTrueOrOne(notification.notif) || !CoreSites.isCurrentSite(notification.site)) {
                return;
            }

            this.refreshNotifications();
        });

        this.readObserver = CoreEvents.on(AddonNotificationsProvider.READ_CHANGED_EVENT, (data) => {
            if (!data.id) {
                return;
            }

            const notification = this.notifications.items.find((notification) => notification.id === data.id);
            if (!notification) {
                return;
            }

            notification.read = true;
            notification.timeread = data.time;
            this.loadMarkAllAsReadButton();
        });

        const deepLinkManager = new CoreMainMenuDeepLinkManager();
        deepLinkManager.treatLink();
    }

    /**
     * Convenience function to get notifications. Gets unread notifications first.
     *
     * @param reload Whether to reload the list or load the next page.
     */
    protected async fetchNotifications(reload: boolean): Promise<void> {
        this.notificationIsLoading = true;

        reload
            ? await this.notifications.reload()
            : await this.notifications.load();

        this.fetchMoreNotificationsFailed = false;
        this.loadMarkAllAsReadButton();

        this.notificationIsLoading = false;
        this.notificationList = [];
        this.notifications.items.forEach((item) => {
            let newItem = this.CH.cloneJson(item);
            newItem.subTitle = this.CH.getHumanDayDateTimeWithName(newItem.timecreated * 1000);

            this.notificationList.push(newItem);
        });
        this.adjustScreenHeight(".page-slider-notification-list");
    }

    /**
     * Obtain the initial batch of notifications.
     */
    private async fetchInitialNotifications(): Promise<void> {
        try {
            await this.fetchNotifications(true);
        } catch (error) {
            CoreDomUtils.showErrorModalDefault(error, 'Error loading notifications');

            this.notifications.reset();
        }
    }

    /**
     * Load a new batch of Notifications.
     *
     * @param complete Completion callback.
     */
    async fetchMoreNotifications(complete: () => void): Promise<void> {
        try {
            await this.fetchNotifications(false);
        } catch (error) {
            CoreDomUtils.showErrorModalDefault(error, 'Error loading more notifications');

            this.fetchMoreNotificationsFailed = true;
        }

        complete();
    }

    /**
     * Mark all notifications as read.
     *
     * @return Promise resolved when done.
     */
    async markAllNotificationsAsRead(): Promise<void> {
        this.loadingMarkAllNotificationsAsRead = true;

        await CoreUtils.ignoreErrors(AddonNotifications.markAllNotificationsAsRead());

        CoreEvents.trigger(AddonNotificationsProvider.READ_CHANGED_EVENT, {
            time: CoreTimeUtils.timestamp(),
        }, CoreSites.getCurrentSiteId());

        await this.refreshNotifications();
    }

    /**
     * Load mark all notifications as read button.
     *
     * @return Promise resolved when done.
     */
    protected async loadMarkAllAsReadButton(): Promise<void> {
        // Check if mark all as read should be displayed (there are unread notifications).
        try {
            this.loadingMarkAllNotificationsAsRead = true;

            const unreadCountData = await AddonNotifications.getUnreadNotificationsCount();

            this.canMarkAllNotificationsAsRead = unreadCountData.count > 0;
        } finally {
            this.loadingMarkAllNotificationsAsRead = false;
        }
    }

    /**
     * Refresh notifications.
     *
     * @param refresher Refresher.
     */
    async refreshNotifications(refresher?: IonRefresher): Promise<void> {
        await CoreUtils.ignoreErrors(AddonNotifications.invalidateNotificationsList());
        await CoreUtils.ignoreErrors(this.fetchNotifications(true));

        refresher?.complete();
    }

    /**
     * User entered the page.
     */
    ionViewDidEnter(): void {
        this.isCurrentView = true;

        if (!this.pendingRefresh) {
            return;
        }

        this.pendingRefresh = false;

        this.refreshNotifications();
    }

    /**
     * User left the page.
     */
    ionViewDidLeave(): void {
        this.isCurrentView = false;
    }

    /**
     * @inheritdoc
     */
    ngOnDestroy(): void {
        this.cronObserver?.off();
        this.readObserver?.off();
        this.pushObserver?.unsubscribe();
        this.notifications?.destroy();
    }

    selectOne(target: string): void
    {
        if (this.selectedOne != target)
        {
            this.selectedOne = target;
            this.subject = this.CH.capitalize(this.selectedOne);
            let index = target == "notification" ? 0 : 1;
            this.pageSlider.slideTo(index);
            this.adjustScreenHeight(".page-slider-notification-list");
        }
    }
    pageSliderChange(): void
    {
        this.pageSlider.getActiveIndex().then((index) => {
            this.selectedOne = index ? "announcement" : "notification";
            this.subject = this.CH.capitalize(this.selectedOne);
            this.adjustScreenHeight(".page-slider-notification-list");
        });
    }
    isAvailable(data: any): boolean
    {
        return this.CH.isAvailable(data);
    }

    async loadMoreNotifications(): Promise<void>
    {
        try {
            await this.fetchNotifications(false);
        } catch (error) {
            CoreDomUtils.showErrorModalDefault(error, 'Error loading more notifications');

            this.fetchMoreNotificationsFailed = true;
        }
    }

    refreshByCQ(refresher?: IonRefresher): void
    {
        if (this.selectedOne == "notification") this.refreshNotifications(refresher);
        else if (this.selectedOne == "announcement") this.refreshAnnouncements(refresher);
    }
    adjustScreenHeight(pageClass: string): void
    {
        // a moment after slide, make sure the slider has proper height
        setTimeout(() => {
            let parent = document.querySelector(pageClass) as HTMLElement | null;
            let activeChild = document.querySelector(pageClass + " .swiper-wrapper .swiper-slide-active > div:first-child") as HTMLDivElement | null;
            if (parent && activeChild)
            {
                parent.style.height = activeChild.offsetHeight + 0 + "px";
            }
        }, 200);
    }

    // =========================================================================================================== announcement
    loadAnnouncements(mode?: string, refresher?: IonRefresher): void
    {
        this.announcementIsLoading = true;
        const params: any = {
            class: "CqLib",
            function: "get_announcements",
            page: mode && mode == "refresh" ? 1 : this.announcementPage,
            length: mode && mode == "refresh" ? ((this.announcementPage - 1) * 30) : 30,
        };
        this.CH.callApi(params)
        .then((data) => {
            let announcements = this.CH.toArray(this.CH.toJson(data));
            this.announcementReachedEndOfList = this.CH.isEmpty(announcements) || this.CH.getLength(announcements) < 30;

            announcements.map((announcement) => {
                announcement.subTitle = this.CH.getHumanDayDateTimeWithName(announcement.subTitle);
                return announcement;
            });

            if (mode && mode == "load_more") this.announcementList = this.announcementList.concat(announcements);
            else this.announcementList = announcements;

            if (mode && mode == "refresh") {}
            else this.announcementPage++;

            this.announcementLoaded = true;
            this.announcementIsLoading = false;
        })
        .catch(() => {
            this.announcementIsLoading = false;
            
            // cannot sign up because server is unreachable
            this.CH.alert('Oops!', 'Server is unreachable, please check your internet connection');
        })
        .finally(() => {
            if (refresher) refresher.complete();
            this.adjustScreenHeight(".page-slider-notification-list");
        });
    }
    loadMoreAnnouncements(): void
    {
        this.loadAnnouncements("load_more");
    }
    refreshAnnouncements(refresher?: IonRefresher): void
    {
        this.loadAnnouncements("refresh", refresher);
    }
    openAnnouncement(item): void
    {
        for (let announcement of this.announcementList)
        {
            if (announcement.id == item.id)
            {
                item.read = true;
                item.tags = [];
                break;
            }
        }

        const stateParams: any = {
            discussion_id: item.id,
        };
        CoreNavigator.navigateToSitePath('/CqAnnouncement/index', {
            params: stateParams,
            preferCurrentTab: false,
        });
    }
    markAllAnnouncementsAsRead(): void
    {
    }
}
