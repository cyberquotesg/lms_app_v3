// warning! not ready yet, especially on opening course

import { CqGeneral } from '@/classes/cq_general';
import { Renderer2 } from '@angular/core';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CoreApp } from '@services/app';
import { CqHelper } from '@services/cq_helper';

export class CqPage extends CqGeneral
{
    /* MUST BE DEFINED:
     * 
     * pageDefaults:
     * is a set key-value pairs that must be owned by default, pageData will follow pageDefault until it has it's own
     * 
     * pageJob:
     * a list of job that must be ran in a page
     * 
     * functions with same name as pageJob:
     * as pageJob has beed defined, system will look for corresponding function to run and mark it as done
     * within that function, must call 'pageJobExecuter'
    */

    pageStatus = false;
    pageForce = false;
    pageSoftForce = false;
    pageParams: any = {};
    pageDefaults: any = {};
    pageData: any = {};
    pageJob: any = {};
    pageJobLoadMore: any = {};

    page = 1;
    length = 12;
    reachedEndOfList = false;
    loadMoreError = false;

    cqCountry: any;
    cqOrganization: any;

    constructor(public renderer: Renderer2, CH: CqHelper)
    {
        super(CH);
    }

    usuallyOnInit(): void
    {
        const isLoggedIn = this.CH.getSites().isLoggedIn();
        const data = this.CH.getCountryOrganizationData();

        if (isLoggedIn && data.result)
        {
            this.cqCountry = data.cqCountry;
            this.cqOrganization = data.cqOrganization;
            this.renderer.addClass(this.CH.getBody(), 'logged-in');
            this.renderer.setProperty(this.CH.getBody(), 'style', data.cssVars.join(';'));
        }
        else
        {
            this.CH.getSites().logout().then(() => {
                let pageName = '';
                const url = typeof this.CH.config().siteurl == 'string' ?
                    this.CH.config().siteurl : this.CH.config().siteurl[0].url;

                // only logged out, country and organization are set, go to login page
                if (!isLoggedIn && data.result) pageName = 'CoreLoginCredentialsPage';

                // has country, but no organization, go to organization selector page
                else if (data.cqCountry && !data.cqOrganization) pageName = 'CqPreLoginOrganization';

                // anything else, go to country selector page
                else pageName = 'CqPreLoginCountry';
                
                // using root nav controller
                CoreApp.instance.getRootNavController().setRoot(pageName, { siteUrl: url }, { animate: false });
            });
        }

        this.pageLoad();
    }
    usuallyOnViewWillEnter(): void
    {
    }
    usuallyOnViewDidEnter(): void
    {
    }
    usuallyOnViewWillLeave(): void
    {
    }
    usuallyOnViewDidLeave(): void
    {
    }

    /* handles page load
     * this function should work automatically
    */
    pageLoad(moreloader?: any, refresher?: any, pageJob?: any, isDependantCall?: boolean, finalCallback?: any): void
    {
        let firstload = !this.pageStatus;
        let loadingmore = typeof moreloader != 'undefined' && moreloader != null;
        let refreshing = typeof refresher != 'undefined' && refresher != null;
        let mode = this.defineMode(moreloader, refresher);
        let modeData = this.handlePageByMode(mode);

        if (firstload || loadingmore || refreshing || this.pageForce || this.pageSoftForce)
        {
            // set page data to default
            if (!refreshing && !isDependantCall && !loadingmore && !this.pageSoftForce)
            {
                for (var key in this.pageDefaults)
                {
                    if (typeof this.pageDefaults[key] != 'object') this.pageData[key] = this.pageDefaults[key];
                    else this.pageData[key] = JSON.parse(JSON.stringify(this.pageDefaults[key]));
                }
            }

            // check the job
            if (typeof pageJob == 'undefined' || pageJob == null)
            {
                pageJob = this.pageJob;
            }
            else if (typeof pageJob == 'string')
            {
                let temp = {};
                temp[pageJob] = 0;
                pageJob = temp;
            }

            // re-run the jobs
            for (var job in pageJob)
            {
                // if the job has dependency
                if (typeof this.pageJob[job] == 'object')
                {
                    pageJob[job].value = 0;
                    this[`${job}`](job, moreloader, refresher, modeData, (newJob, newMoreloader, newRefresher, newFinalCallback) => {
                        this.pageLoad(newMoreloader, newRefresher, pageJob[newJob].next, true, newFinalCallback);
                    }, finalCallback);
                }

                // if the job is just plain job
                else
                {
                    pageJob[job] = 0;
                    this[`${job}`](job, moreloader, refresher, modeData, null, finalCallback);
                }
            }

            // if this is not dependant call and pageJob is empty, then pageJobExecuterFinally
            if (!isDependantCall && this.CH.isEmpty(pageJob))
            {
                this.pageJobExecuterFinally(moreloader, refresher, finalCallback);
            }
        }
    }
    pageLoadMore(moreloader: any): void
    {
        this.CH.log("loading more");
        this.pageLoad(moreloader, null, this.pageJobLoadMore);
    }
    pageRefresh(refresher: any): void
    {
        this.CH.log("refreshering");
        this.pageLoad(null, refresher);
    }
    pageForceReferesh(finalCallback?: any): void
    {
        this.pageForce = true;
        this.pageLoad(null, null, null, false, finalCallback);
    }
    pageSoftForceReferesh(finalCallback?: any): void
    {
        this.pageSoftForce = true;
        this.pageLoad(null, null, null, false, finalCallback);
    }

    /* execute job of a page that has been defined
     * 
     * jobName is a job this executer related to, or the function name
     * executer can be: no, custom, raw, helper
     * api name is api name or function name that is stored in server
     * data is data to be sent to server
     * moreloader is object for loading more contents
     * refresher is object for refreshing the page
     * callback is additional function
     * finalCallback is additional function that must be set from pageLoad, pageForceReferesh, or pageSoftForceReferesh function
    */
    pageJobExecuter(jobName: string, executer: string, apiName: string, data: any, callback: any, moreloader?: any, refresher?: any, finalCallback?: any): void
    {
        // if this is first load and a param value exist, then use it, don't call job
        if (!this.pageStatus && typeof this.pageParams[jobName] != 'undefined')
        {
            this.CH.setPageJobNumbers(this.pageJob, jobName, 1);
            this.CH.log('successfully run ' + jobName + ' with type of response: parameter');
            callback(this.pageParams[jobName]);
            this.pageJobExecuterFinally(moreloader, refresher, finalCallback);

            return;
        }

        let promise;
        if (executer == 'no') promise = this.CH.callNoApi(apiName, data);
        else if (executer == 'moodle') promise = this.CH.callMoodleApi(apiName, data);
        else if (executer == 'custom') promise = this.CH.callCustomApi(apiName, data);
        else if (executer == 'raw') promise = this.CH.callRawApi(apiName, data);
        else promise = this.CH.callDirectApi(executer, apiName, data);

        if (!promise)
        {
            this.CH.log('the executer ' + executer + ' is not recognized');
            return;
        }

        promise
        .then((response) => {
            this.CH.setPageJobNumbers(this.pageJob, jobName, 1);
            this.CH.log('success to run api', jobName);
            this.CH.log('type of response', typeof response);
            let callbackData = executer == 'custom' && typeof response == 'string' ? JSON.parse(response) : response;

            if (callbackData && callbackData.exception) throw (callbackData);
            else callback(callbackData);
        })
        .catch((e) => {
            this.CH.setPageJobNumbers(this.pageJob, jobName, -1);
            this.CH.log('failed to call api', jobName);
            this.CH.log(e);

            if (e.message) this.CH.alert('Ups!', e.message);
            else this.CH.alert('Ups!', 'We have trouble, please try again');
        })
        .finally(() => {
            this.pageJobExecuterFinally(moreloader, refresher, finalCallback);
        });
    }
    pageJobExecuterFinally(moreloader?: any, refresher?: any, finalCallback?: any): void
    {
        var numbers = this.CH.getPageJobNumbers(this.pageJob);
        this.CH.log('numbers', numbers);
        this.CH.handlePageStatus(numbers)
        .then((status) => {
            this.CH.log('page status', status);
            this.CH.log('page params', this.pageParams);
            this.CH.log('final data', this.pageData);
            this.pageStatus = true;
            this.pageForce = false;
            this.pageSoftForce = false;

            if (typeof moreloader == 'function') moreloader();
            if (refresher) refresher.complete();
            if (typeof finalCallback == 'function') finalCallback();
        })
        .catch((e) => {
            this.CH.log('cannot set page status');
            this.CH.log(e);
        });
    }

    defineMode(moreloader?: any, refresher?: any): string
    {
        let loadingmore = typeof moreloader != 'undefined' && moreloader != null,
            refreshing = typeof refresher != 'undefined' && refresher != null;

        if (!loadingmore && !refreshing) return 'firstload';
        else if (loadingmore) return 'loadingmore';
        else if (refreshing) return 'refreshing';
        else 'unknown';
    }
    handlePageByMode(mode: string): any
    {
        let page, length;

        if (mode == 'firstload')
        {
            this.CH.log('this is firstload');
            page = this.page;
            length = this.length;
        }
        else if (mode == 'loadingmore')
        {
            this.CH.log('this is loadingmore');
            this.page++;
            page = this.page;
            length = this.length;
        }
        else if (mode == 'refreshing')
        {
            this.CH.log('this is refreshing');
            page = 1;
            length = this.page * this.length;
        }
        else
        {
            this.CH.log('this is everything else');
            page = this.page;
            length = this.length;
        }

        return { mode, page, length };
    }

    toggleDrawer(): void
    {
        this.CH.toggleDrawer();
    }
    goToNotificationsList(): void
    {
        this.CH.goToNotificationsList();
    }

    openCourse(course: any): void
    {
        if (course.media == 'online')
        {
            // this.CH.getCourses().getCoursesByField().then((courses) => {
            //     var thisCourse = courses.filter((thisCourse) => {
            //         return thisCourse.id == course.id;
            //     })[0];

            //     if (thisCourse.isEnrolled) {
            //         this.CH.getCourseHelper().openCourse(thisCourse);
            //     } else {
            //         CoreNavigator.navigate('CoreCoursesCoursePreviewPage', {course: thisCourse});
            //     }
            // }).catch((error) => {
            //     this.CH.alert('Ups!', error.message);
            // });

            CoreNavigator.navigate('CoreCoursesCoursePreviewPage', {course: course});
        }
        else if (course.media == 'offline')
        {
            CoreNavigator.navigate('CqClassroomTrainingPage', {
                courseId: course.id,
                courseName: course.name
            });
        }
        else
        {
            this.CH.log("course media is not defined");
        }
    }
    openOfflineCourse(course: any): void
    {
        course.media = 'offline';
        this.openCourse(course);
    }
    openOnlineCourse(course: any): void
    {
        course.media = 'online';
        this.openCourse(course);
    }

    /**
     * media: online or offline
    */
    openCourseById(media: string, courseId: number): void
    {
        if (media == 'online')
        {
            const frontpageCourseId = this.CH.getSites().getCurrentSite().getSiteHomeId();
            this.CH.getCourses().getCoursesByField('user_id', this.CH.getUserId()).then((courses) => {
                let coursesData = courses.filter((course) => {
                    return course.id != frontpageCourseId && course.id == courseId;
                }).map((course) => {
                    course.media = 'online';
                    return course;
                });

                if (!this.CH.isEmpty(coursesData))
                {
                    if (coursesData[0].isEnrolled) this.CH.getCourseHelper().openCourse(coursesData[0]);
                    else CoreNavigator.navigate('CoreCoursesCoursePreviewPage', {course: coursesData[0]});
                }                
                else this.CH.alert('Oops!', 'It seems like you are not permitted to open the course');
            }).catch((error) => {
                this.CH.alert('Ups!', 'Cannot open the course');
            });
        }
        else if (media == 'offline')
        {
            CoreNavigator.navigate('CqClassroomTrainingPage', {
                courseId: courseId,
                courseName: ''
            });
        }
    }
    openOfflineCourseById(courseId: number): void
    {
        this.openCourseById('offline', courseId);
    }
    openOnlineCourseById(courseId: number): void
    {
        this.openCourseById('online', courseId);
    }
}
