// warning! not ready yet, especially on opening course
// warning! CoreNavigator.navigate is still having wrong param

import { Renderer2 } from '@angular/core';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CoreCourseHelper } from '@features/course/services/course-helper';
import { CqGeneral } from './cq_general';
import { CqHelper } from '../services/cq_helper';

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
    pageIsForcedFirstload = false;
    pageIsForcedRefresh = false;
    pageParams: any = {};
    pageDefaults: any = {};
    pageData: any = {};
    pageJob: any = {};
    pageJobLoadMore: any = {};
    pageIsLoading = false;

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
        const isLoggedIn = this.CH.isLoggedIn();
        const data = this.CH.getCountryOrganizationData();

        if (isLoggedIn && data.result)
        {
            this.cqCountry = data.cqCountry;
            this.cqOrganization = data.cqOrganization;
            this.renderer.addClass(this.CH.getBody(), 'logged-in');
            this.renderer.setProperty(this.CH.getBody(), 'style', data.cssVars.join(';'));

            // catch parameters automatically
        	for (let paramName in this.pageParams)
        	{
        		this.pageParams[paramName] = CoreNavigator.getRouteNumberParam(paramName);
        	}

            this.pageLoad();
        }
        else
        {
            this.CH.logout().then(() => {
                CoreNavigator.navigateToLoginCredentials();
            });
        }
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

        if (firstload || loadingmore || refreshing || this.pageIsForcedFirstload || this.pageIsForcedRefresh)
        {
            this.pageIsLoading = true;

            // set page data to default
            if (!refreshing && !isDependantCall && !loadingmore && !this.pageIsForcedRefresh)
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
        this.pageLoad(moreloader, null, this.pageJobLoadMore);
    }
    pageRefresh(refresher: any): void
    {
        this.pageLoad(null, refresher);
    }
    pageForcedFirstload(finalCallback?: any): void
    {
        this.pageIsForcedFirstload = true;
        this.pageLoad(null, null, null, false, finalCallback);
    }
    pageForceReferesh(finalCallback?: any): void
    {
        this.pageIsForcedRefresh = true;
        this.pageLoad(null, null, null, false, finalCallback);
    }

    /* execute job of a page that has been defined
     * 
     * jobName is a job this executer related to, or the function name
     * params is params to be sent to server
     * moreloader is object for loading more contents
     * refresher is object for refreshing the page
     * callback is additional function
     * finalCallback is additional function that must be set from pageLoad, pageForcedFirstload, or pageForceReferesh function
    */
    pageJobExecuter(jobName: string, params: any, callback: any, moreloader?: any, refresher?: any, finalCallback?: any): void
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

        this.CH.callApi(params)
        .then((response) => {
            this.CH.setPageJobNumbers(this.pageJob, jobName, 1);
            this.CH.log('success to run api', jobName);
            this.CH.log('type of response', typeof response);

            if (response && response.exception) throw (response);
            else callback(response);
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
            this.pageIsForcedFirstload = false;
            this.pageIsForcedRefresh = false;
            this.pageIsLoading = false;

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

        if (!loadingmore && !refreshing)
        {
            if (this.pageIsForcedFirstload) return 'forced-firstload';
            else if (this.pageIsForcedRefresh) return 'forced-refresh';
            else return 'firstload';
        }
        else if (loadingmore) return 'loadmore';
        else if (refreshing) return 'refresh';
        else return 'unknown';
    }
    handlePageByMode(mode: string): any
    {
        let page, length;
        this.CH.log('this is', mode);

        if (mode == 'firstload' || mode == 'forced-firstload')
        {
            page = 1;
            length = this.length;
        }
        else if (mode == 'loadmore')
        {
            this.page++;
            page = this.page;
            length = this.length;
        }
        else if (mode == 'refresh' || mode == 'forced-refresh')
        {
            page = 1;
            length = this.page * this.length;
        }
        
        // everything else
        else
        {
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

            // CoreNavigator.navigate('CoreCoursesCoursePreviewPage', {course: course});
        }
        else if (course.media == 'offline')
        {
            // CoreNavigator.navigate('CqClassroomTrainingPage', {
            //     courseId: course.id,
            //     courseName: course.name
            // });
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
            CoreCourseHelper.openCourse({id: courseId});
        }
        else if (media == 'offline')
        {
            // CoreNavigator.navigate('CqClassroomTrainingPage', {
            //     courseId: courseId,
            //     courseName: ''
            // });
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
