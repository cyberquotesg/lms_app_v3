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

import { Component, ViewChild, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { CoreTabsOutletTab, CoreTabsOutletComponent } from '@components/tabs-outlet/tabs-outlet';
import { CoreCourseFormatDelegate } from '../../services/format-delegate';
import { CoreCourseOptionsDelegate } from '../../services/course-options-delegate';
import { CoreCourseAnyCourseData } from '@features/courses/services/courses';
import { CoreEventObserver, CoreEvents } from '@singletons/events';
import { CoreCourse, CoreCourseProvider, CoreCourseWSSection } from '@features/course/services/course';
import { CoreCourseHelper, CoreCourseModuleData } from '@features/course/services/course-helper';
import { CoreUtils } from '@services/utils/utils';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CONTENTS_PAGE_NAME } from '@features/course/course.module';
import { CoreDomUtils } from '@services/utils/dom';
import { CoreCoursesHelper, CoreCourseWithImageAndColor } from '@features/courses/services/courses-helper';
import { CoreColors } from '@singletons/colors';
import { CorePath } from '@singletons/path';
import { CoreSites } from '@services/sites';

// by rachmad
import { IonRefresher } from '@ionic/angular';
import { Renderer2 } from '@angular/core';
import { CoreCourseModulePrefetchDelegate } from '@features/course/services/module-prefetch-delegate';
import { CoreCourseCompletionActivityStatus } from '@features/course/services/course';
import { CoreCourses } from '@features/courses/services/courses';
import { CqPage } from '@features/cq_pages/classes/cq_page';
import { CqHelper } from '@features/cq_pages/services/cq_helper';
import { CoreCourseSync, CoreCourseSyncProvider } from '@features/course/services/sync';
import { CoreSiteWSPreSets, CoreSite, WSObservable } from '@classes/site';
import { CoreGrades, CoreGradesGradeItem } from '@features/grades/services/grades';

/**
 * Page that displays the list of courses the user is enrolled in.
 */
@Component({
    selector: 'page-core-course-index',
    templateUrl: 'index.new.html',
    styleUrls: ['index.scss'],
})

// by rachmad
// export class CoreCourseIndexPage implements OnInit, OnDestroy {
export class CoreCourseIndexPage extends CqPage implements OnInit, OnDestroy {

    @ViewChild(CoreTabsOutletComponent) tabsComponent?: CoreTabsOutletComponent;
    @ViewChild('courseThumb') courseThumb?: ElementRef;

    title = '';
    category = '';
    course?: CoreCourseWithImageAndColor & CoreCourseAnyCourseData & {courseImage, fullname, basicInformation, hasEnded, hasEnrolled, isSelfEnrol, selfEnrolId, hasAccredited};
    tabs: CourseTab[] = [];
    loaded = false;
    progress?: number;
    fullScreenEnabled = false;

    // by rachmad
    cqLoading: boolean = false;
    grades: any = {
        summary: "-",
        onCourse: [],
        onModule: {},
    };

    sections: CoreCourseWSSection[] = []; // List of course sections.
    protected currentPagePath = '';
    protected fullScreenObserver: CoreEventObserver;
    protected selectTabObserver: CoreEventObserver;
<<<<<<< HEAD
    protected completionObserver: CoreEventObserver;
=======
    protected progressObserver: CoreEventObserver;
    protected sections: CoreCourseWSSection[] = []; // List of course sections.
>>>>>>> latest
    protected firstTabName?: string;
    protected module?: CoreCourseModuleData;
    protected modNavOptions?: CoreNavigationOptions;
    protected isGuest = false;
    protected openModule = true;
    protected contentsTab: CoreTabsOutletTab & { pageParams: Params } = {
        page: CONTENTS_PAGE_NAME,
        title: 'core.course',
        pageParams: {},
    };

    // by rachmad
    // constructor(private route: ActivatedRoute) {
    constructor(private route: ActivatedRoute, renderer: Renderer2, CH: CqHelper) {
        super(renderer, CH);

        this.selectTabObserver = CoreEvents.on(CoreEvents.SELECT_COURSE_TAB, (data) => {
            if (!data.name) {
                // If needed, set sectionId and sectionNumber. They'll only be used if the content tabs hasn't been loaded yet.
                if (data.sectionId) {
                    this.contentsTab.pageParams.sectionId = data.sectionId;
                }
                if (data.sectionNumber !== undefined) {
                    this.contentsTab.pageParams.sectionNumber = data.sectionNumber;
                }

                // Select course contents.
                this.tabsComponent?.selectByIndex(0);
            } else if (this.tabs) {
                const index = this.tabs.findIndex((tab) => tab.name == data.name);

                if (index >= 0) {
                    this.tabsComponent?.selectByIndex(index);
                }
            }
        });

        const siteId = CoreSites.getCurrentSiteId();

        this.progressObserver = CoreEvents.on(CoreCourseProvider.PROGRESS_UPDATED, (data) => {
            if (!this.course || this.course.id !== data.courseId || !('progress' in this.course)) {
                return;
            }

            this.course.progress = data.progress;
            this.updateProgress();
        }, siteId);

        this.fullScreenObserver = CoreEvents.on(CoreEvents.FULL_SCREEN_CHANGED, (event: { enabled: boolean }) => {
            this.fullScreenEnabled = event.enabled;
        });
    }

    // by rachmad
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }

    /**
     * @inheritdoc
     */
    async ngOnInit(): Promise<void> {
        // Increase route depth.
        const path = CoreNavigator.getRouteFullPath(this.route);

        CoreNavigator.increaseRouteDepth(path.replace(/(\/deep)+/, ''));

        try {
            this.course = CoreNavigator.getRequiredRouteParam('course');
        } catch (error) {
            CoreDomUtils.showErrorModal(error);
            CoreNavigator.back();
            this.loaded = true;

            return;
        }

        this.firstTabName = CoreNavigator.getRouteParam('selectedTab');
        this.module = CoreNavigator.getRouteParam<CoreCourseModuleData>('module');
        this.isGuest = CoreNavigator.getRouteBooleanParam('isGuest') ??
            (!!this.course && (await CoreCourseHelper.courseUsesGuestAccessInfo(this.course.id)).guestAccess);

        this.modNavOptions = CoreNavigator.getRouteParam<CoreNavigationOptions>('modNavOptions');
        this.openModule = CoreNavigator.getRouteBooleanParam('openModule') ?? true; // If false, just scroll to module.
        this.currentPagePath = CoreNavigator.getCurrentPath();
        this.contentsTab.page = CorePath.concatenatePaths(this.currentPagePath, this.contentsTab.page);
        this.contentsTab.pageParams = {
            course: this.course,
            sectionId: CoreNavigator.getRouteNumberParam('sectionId'),
            sectionNumber: CoreNavigator.getRouteNumberParam('sectionNumber'),
            blockInstanceId: CoreNavigator.getRouteNumberParam('blockInstanceId'),
            isGuest: this.isGuest,
        };

        if (this.module) {
            this.contentsTab.pageParams.moduleId = this.module.id;
            if (!this.contentsTab.pageParams.sectionId && this.contentsTab.pageParams.sectionNumber === undefined) {
                // No section specified, use module section.
                this.contentsTab.pageParams.sectionId = this.module.section;
            }
        }

        // by rachmad
        // this.tabs.push(this.contentsTab);
        // this.loaded = true;

        await Promise.all([
            this.loadCourseHandlers(),
            this.loadBasinInfo(),
        ]);

        // by rachmad
        await this.prepareSections();
        await this.prepareCourseData("additionals");
        this.tabs.push(this.contentsTab);
        this.loaded = true;
        this.pageStatus = true;
    }

    /**
     * A tab was selected.
     */
    tabSelected(): void {
        if (!this.module || !this.course || !this.openModule) {
            return;
        }
        // Now that the first tab has been selected we can load the module.
        CoreCourseHelper.openModule(this.module, this.course.id, {
            sectionId: this.contentsTab.pageParams.sectionId,
            modNavOptions: this.modNavOptions,
        });

        delete this.module;
    }

    /**
     * Load course option handlers.
     *
     * @returns Promise resolved when done.
     */
    protected async loadCourseHandlers(): Promise<void> {
        if (!this.course) {
            return;
        }

        // Load the course handlers.
        const handlers = await CoreCourseOptionsDelegate.getHandlersToDisplay(this.course, false, this.isGuest);

        let tabToLoad: number | undefined;

        // Create the full path.
        handlers.forEach((handler, index) => {
            handler.data.page = CorePath.concatenatePaths(this.currentPagePath, handler.data.page);
            handler.data.pageParams = handler.data.pageParams || {};

            // Check if this handler should be the first selected tab.
            if (this.firstTabName && handler.name == this.firstTabName) {
                tabToLoad = index + 1;
            }
        });

        this.tabs = [...this.tabs, ...handlers.map(handler => ({
            ...handler.data,
            name: handler.name,
        }))];

        // Select the tab if needed.
        this.firstTabName = undefined;
        if (tabToLoad) {
            await CoreUtils.nextTick();

            this.tabsComponent?.selectByIndex(tabToLoad);
        }
    }

    /**
     * Load title for the page.
     *
     * @returns Promise resolved when done.
     */
    protected async loadBasinInfo(): Promise<void> {
        if (!this.course) {
            return;
        }

        // Get the title to display initially.
        this.title = CoreCourseFormatDelegate.getCourseTitle(this.course);

        await this.setCourseColor();

        this.updateProgress();

        // by rachmad
        let presets: CoreSiteWSPreSets = {
            getFromCache: false,
            saveToCache: true,
            emergencyCache: true,
        };
        let sections: CoreCourseWSSection[] = [];
        sections = await CoreUtils.ignoreErrors(CoreCourse.getSections(this.course.id, false, true, presets), []);
        sections = sections.filter((section) => {
            return section.modules.length;
        });
        this.sections = sections;

        // Load sections.
        // this.sections = await CoreUtils.ignoreErrors(CoreCourse.getSections(this.course.id, false, true), []);

        if (!this.sections) {
            return;
        }

        // Get the title again now that we have sections.
        this.title = CoreCourseFormatDelegate.getCourseTitle(this.course, this.sections);
    }

    /**
     * @inheritdoc
     */
    ngOnDestroy(): void {
        const path = CoreNavigator.getRouteFullPath(this.route);

        CoreNavigator.decreaseRouteDepth(path.replace(/(\/deep)+/, ''));
        this.selectTabObserver?.off();
        this.progressObserver?.off();
        this.fullScreenObserver?.off();
    }

    /**
     * User entered the page.
     */
    ionViewDidEnter(): void {
        this.tabsComponent?.ionViewDidEnter();
    }

    /**
     * User left the page.
     */
    ionViewDidLeave(): void {
        this.tabsComponent?.ionViewDidLeave();
    }

    /**
     * Open the course summary
     */
    openCourseSummary(): void {
        if (this.course) {
            CoreCourseHelper.openCourseSummary(this.course);
        }
    }

    /**
     * Update course progress.
     */
    protected updateProgress(): void {
        if (
            !this.course ||
                !('progress' in this.course) ||
                typeof this.course.progress !== 'number' ||
                this.course.progress < 0 ||
                this.course.completionusertracked === false
        ) {
            this.progress = undefined;

            return;
        }

        this.progress = this.course.progress;
    }

    /**
     * Set course color.
     */
    protected async setCourseColor(): Promise<void> {
        if (!this.course) {
            return;
        }

        await CoreCoursesHelper.loadCourseColorAndImage(this.course);

        if (!this.courseThumb) {
            return;
        }

        if (this.course.color) {
            this.courseThumb.nativeElement.style.setProperty('--course-color', this.course.color);

            const tint = CoreColors.lighter(this.course.color, 50);
            this.courseThumb.nativeElement.style.setProperty('--course-color-tint', tint);
        } else if(this.course.colorNumber !== undefined) {
            this.courseThumb.nativeElement.classList.add('course-color-' + this.course.colorNumber);
        }
    }

    // ====================================================================================================== by rachmad
    // overwrite pageForceReferesh() function from parent class, because this class doesn't have approriate things to run it
    pageForceReferesh(finalCallback?: any): void
    {
        this.doRefresh().then(() => {
            if (typeof finalCallback == "function") finalCallback();
        });
    }
    async doRefresh(refresher?: IonRefresher): Promise<void> {
        if (!this.course) return;

        this.pageIsLoading = true;
        
        // Try to synchronize the course data.
        // For now we don't allow manual syncing, so ignore errors.
        const result = await CoreUtils.ignoreErrors(CoreCourseSync.syncCourse(
            this.course.id,
            this.course.displayname || this.course.fullname,
        ));
        if (result?.warnings?.length) {
            CoreDomUtils.showErrorModal(result.warnings[0]);
        }

        await this.loadBasinInfo();
        await this.prepareSections(true);
        await this.prepareCourseData("course, additionals");

        this.pageIsLoading = false;

        refresher?.complete();
    }
    /**
     * mode can be: course, additionals, string containing both values
    */
    async prepareCourseData(mode: string): Promise<any>
    {
        if (!this.course) return {};

        let modeArray = this.CH.toArray(mode);
        let params: any = {calls: {}};
        if (modeArray.includes("course"))
        {
            params.calls.course = {
                cluster: 'CqCourseLib',
                endpoint: 'view_e_learning',
                course_id: this.course!.id,
            };
        }
        if (modeArray.includes("additionals"))
        {
            params.calls.additionals = {
                cluster: 'CqCourseLib',
                endpoint: 'additionals_e_learning',
                course_id: this.course!.id,
            };
        }
        let temp = await this.CH.callApi(params);
        let data = this.CH.toJson(temp);

        let course: any;
        if (modeArray.includes("course")) course = this.CH.cloneJson(data.course);
        else course = this.CH.cloneJson(this.course);
        if (modeArray.includes("additionals"))
        {
            for (let name in data.additionals)
            {
                course[name] = data.additionals[name];
            }
        }
        this.course = course;

        // fake values to force compiler accept the variable
        if (typeof this.course!.courseImage == "undefined") this.course!.courseImage = null;
        if (typeof this.course!.fullname == "undefined") this.course!.fullname = "";
        if (typeof this.course!.basicInformation == "undefined") this.course!.basicInformation = [];
        if (typeof this.course!.hasEnded == "undefined") this.course!.hasEnded = false;
        if (typeof this.course!.hasEnrolled == "undefined") this.course!.hasEnrolled = false;
        if (typeof this.course!.hasAccredited == "undefined") this.course!.hasAccredited = false;
        if (typeof this.course!.isSelfEnrol == "undefined") this.course!.isSelfEnrol = false;
        if (typeof this.course!.selfEnrolId == "undefined") this.course!.selfEnrolId = 0;

        let tempGrades: any = [],
            grades: any = {
                summary: "-",
                onCourse: [],
                onModule: {},
            };
        
        if (this.course!.hasEnrolled)
        {
            tempGrades = await CoreGrades.getGradeItems(this.course!.id, 0, 0, "", true);
            tempGrades.forEach((grade) => {
                // has cmid, so it is onModule
                if (grade.cmid)
                {
                    grades.onModule[grade.cmid] = grade.gradeformatted;
                }

                // always include to onCourse
                grades.onCourse.push({
                    name: grade.itemname ? grade.itemname : grade.itemtype == "course" ? "Total Grade" : "-",
                    value: grade.gradeformatted === "" ? "-" : grade.gradeformatted,
                    range: grade.rangeformatted === "" ? "-" : grade.rangeformatted,
                    inPercent: grade.percentageformatted === "" ? "-" : grade.percentageformatted,
                });

                // summary
                if (grade.itemtype == "course")
                {
                    grades.summary = grade.gradeformatted === "" ? "-" : grade.gradeformatted;
                    grades.summary += grade.percentageformatted != "" && grade.percentageformatted != "-" ? (" (" + grade.percentageformatted + ")") : "";
                }
            });
        }

        this.grades = grades;

        // remove link in availability info
        this.sections.forEach((section) => {
            section.modules.forEach((courseModule) => {
                if (courseModule.availabilityinfo)
                {
                    courseModule.availabilityinfo = courseModule.availabilityinfo.replace(/\<a /g, "<b ").replace(/\<\/a\>/g, "</b>").replace(/ href/g, " data-href");
                }
            });
        });

        this.CH.log("final data", {
            course: this.course,
            sections: this.sections,
            grades: this.grades,
            tempGrades,
        });
    }
    async prepareSections(refresh?: boolean): Promise<void> {
        if (!this.course) return;

        let presets: CoreSiteWSPreSets = {
            getFromCache: false,
            saveToCache: true,
            emergencyCache: true,
        };
        let sections: CoreCourseWSSection[] = [];
        sections = await CoreUtils.ignoreErrors(CoreCourse.getSections(this.course.id, false, true, presets), []);
        sections = sections.filter((section) => {
            return section.modules.length;
        });

        if (refresh) {
            // Invalidate the recently downloaded module list. To ensure info can be prefetched.
            const modules = CoreCourse.getSectionsModules(sections);

            await CoreCourseModulePrefetchDelegate.invalidateModules(modules, this.course.id);
        }

        let completionStatus: Record<string, CoreCourseCompletionActivityStatus> = {};

        // Get the completion status.
        if (this.course.enablecompletion !== false) {
            const sectionWithModules = sections.find((section) => section.modules.length > 0);

            if (sectionWithModules && sectionWithModules.modules[0].completion !== undefined) {
                await CoreUtils.ignoreErrors(CoreCourseHelper.loadOfflineCompletion(this.course.id, sections));
            } else {
                const fetchedData = await CoreUtils.ignoreErrors(
                    CoreCourse.getActivitiesCompletionStatus(this.course.id),
                );

                completionStatus = fetchedData || completionStatus;
            }
        }

        // Add handlers
        const result = await CoreCourseHelper.addHandlerDataForModules(
            sections,
            this.course.id,
            completionStatus,
            this.course.fullname,
            true,
        );

        this.sections = result.sections;
    }

    async takeCourse(): Promise<void>
    {
        if (!this.course) return;

        this.cqLoading = true;
        try
        {
            await CoreCourses.selfEnrol(this.course.id, "", this.course.selfEnrolId);
            await this.doRefresh();
            this.cqLoading = false;
            this.CH.alert("Success!", "You have successfully signed up to " + this.course.fullname + " Course");
        }
        catch(error)
        {
            this.cqLoading = false;
            this.CH.errorLog("enrolment error", {courseId: this.course.id, media: "online", purpose: "sign_up", error});
            this.CH.alert("Oops!", "Cannot enrol to the course, please contact course administrator");
        }
    }
    leaveCourse(): void
    {
        this.CH.alert('Confirm!', 'Are you sure to withdraw from this course?', {
            text: 'Sure',
            role: 'sure',
            handler: async (): Promise<void> => {
                if (!this.course) return;

                this.cqLoading = true;
                try
                {
                    const params = {
                        cluster: 'CqCourseLib',
                        endpoint: 'unenrol_e_learning',
                        course_id: this.course.id,
                    };
                    await this.CH.callApi(params);
                    await this.doRefresh();
                    this.cqLoading = false;
                    this.CH.alert("Success!", "You have successfully withdrawn from " + this.course.fullname + " Course");
                }
                catch(error)
                {
                    this.cqLoading = false;
                    this.CH.errorLog("enrolment error", {courseId: this.course.id, media: "online", purpose: "withdraw", error});
                    this.CH.alert("Oops!", "Cannot withdraw from the course, please contact course administrator");
                }
            }
        }, {
            text: 'Cancel',
            role: 'cancel',
            handler: (): void => {
            }
        });
    }
    isModuleDisabled(courseSection: any, courseModule: any): boolean
    {
        return !courseSection.uservisible || !courseModule.uservisible || !!courseModule.availabilityinfo;
    }
    getModuleClass(courseSection: any, courseModule: any): string
    {
        if (!this.course) return "";

        return this.course.hasEnrolled && this.isModuleDisabled(courseSection, courseModule) ? "disabled" : "";
    }
    moduleClicked(event: Event, courseSection: any, courseModule: any): void
    {
        if (!this.course) return;
        
        if (!this.course.hasEnrolled)
        {
            this.CH.alert('Oops!', "You are not enrolled to this course");
        }
        else if (this.isModuleDisabled(courseSection, courseModule))
        {
            if (courseModule.availabilityinfo) this.CH.alert('Oops!', courseModule.availabilityinfo);
            else this.CH.alert('Oops!', "This course module is not available");
        }
        else if (CoreCourseHelper.canUserViewModule(courseModule, courseSection))
        {
            if (courseModule.handlerData?.action)
            {
                courseModule.handlerData.action(event, courseModule, courseModule.course);
            }
            else
            {
                this.CH.errorLog("module error", {courseId: this.course.id, courseSection, courseModule, media: "online", error: "courseModule.handlerData?.action is falsy"});
                this.CH.alert('Oops!', "Cannot open this course module, please contact course administrator");
            }
        }
        else
        {
            this.CH.alert('Oops!', "You are not allowed to open this course module");
        }
    }
}

type CourseTab = CoreTabsOutletTab & {
    name?: string;
};
