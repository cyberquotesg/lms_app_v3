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
    pageIsForcedLoadMore = false;
    pageIsForcedRefresh = false;
    pageIsLoading = false;

    pageParams: any = {};
    pageDefaults: any = {};
    pageData: any = {};
    pageJob: any = {};
    pageJobLoadMore: any = {};
    pageJobRefresh: any = {};

    page = 1;
    length = 36;
    reachedEndOfList = false;
    loadMoreError = false;

    cqCountry: any;
    cqOrganization: any;

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(CH);
    }

    usuallyOnInit(beforePageLoad?: any): void
    {
        if (this.CH.isLoggedIn())
        {
            this.consumePageParams();
            this.consumePageDefault();
            if (typeof beforePageLoad == "function") beforePageLoad();
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
        if (this.pageStatus && !this.pageIsLoading)
        {
            this.CH.log("this is considered back, running pageForceReferesh() automatically");
            this.pageForceReferesh();
        }
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

    consumePageParams(): void
    {
        console.log("pageParams", JSON.stringify(this.pageParams));

        for (let paramName in this.pageParams)
        {
            let paramValue = CoreNavigator.getRouteParam(paramName);
            if (typeof paramValue != "undefined") this.pageParams[paramName] = paramValue;
        }
    }
    consumePageDefault(): void
    {
        console.log("pageDefaults", JSON.stringify(this.pageDefaults));

        for (let key in this.pageDefaults)
        {
            if (typeof this.pageDefaults[key] != 'object') this.pageData[key] = this.pageDefaults[key];
            else this.pageData[key] = JSON.parse(JSON.stringify(this.pageDefaults[key]));
        }
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

        if (firstload || loadingmore || refreshing || this.pageIsForcedFirstload || this.pageIsForcedLoadMore || this.pageIsForcedRefresh)
        {
            this.pageIsLoading = true;

            // set page data to default if only the mode is pageIsForcedFirstload
            // first load has been handled by usuallyOnInit
            if (!isDependantCall && this.pageIsForcedFirstload)
            {
                this.consumePageDefault();
            }

            // check the job
            if (typeof pageJob == 'undefined' || pageJob == null || this.CH.isEmpty(pageJob))
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

            // if this is not dependant call and pageJob is empty, then pageJobFinally
            if (!isDependantCall && this.CH.isEmpty(pageJob))
            {
                this.pageJobFinally(moreloader, refresher, finalCallback);
            }
        }
    }
    pageLoadMore(moreloader: any): void
    {
        this.pageLoad(moreloader, null, this.pageJobLoadMore);
    }
    pageRefresh(refresher: any): void
    {
        this.pageLoad(null, refresher, this.pageJobRefresh);
    }

    pageForcedFirstload(finalCallback?: any): void
    {
        this.pageIsForcedFirstload = true;
        this.pageLoad(null, null, null, false, finalCallback);
    }
    pageForceLoadMore(finalCallback?: any): void
    {
        this.pageIsForcedLoadMore = true;
        this.pageLoad(null, null, this.pageJobLoadMore, false, finalCallback);
    }
    pageForceReferesh(finalCallback?: any): void
    {
        this.pageIsForcedRefresh = true;
        this.pageLoad(null, null, this.pageJobRefresh, false, finalCallback);
    }

    pageJobEngine(agent: Promise<any>, jobName: string, params: any, callback: any, moreloader?: any, refresher?: any, finalCallback?: any): void
    {
        agent
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

            if (e.message) this.CH.alert('Oops!', e.message);
            else this.CH.alert('Oops!', 'We have trouble, please try again');
        })
        .finally(() => {
            this.pageJobFinally(moreloader, refresher, finalCallback);
        });
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
            this.pageJobFinally(moreloader, refresher, finalCallback);

            return;
        }

        var agent = this.CH.callApi(params);
        this.pageJobEngine(agent, jobName, params, callback, moreloader, refresher, finalCallback);
    }
    pageJobImitator(jobName: string, params: any, callback: any, moreloader?: any, refresher?: any, finalCallback?: any): void
    {
        var agent = this.CH.callNoApi(params);
        this.pageJobEngine(agent, jobName, params, callback, moreloader, refresher, finalCallback);
    }
    pageJobFinally(moreloader?: any, refresher?: any, finalCallback?: any): void
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
            this.pageIsForcedLoadMore = false;
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
            else if (this.pageIsForcedLoadMore) return 'forced-loadmore';
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
            this.page = 1;
            page = this.page;
            length = this.length;
        }
        else if (mode == 'loadmore' || mode == 'forced-loadmore')
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

    openCourse(course: any): void
    {
        if (course.media == 'online')
        {
            CoreCourseHelper.openCourse(course);
        }
        else if (course.media == 'offline')
        {
            const stateParams: any = {
                courseId: course.id,
                courseName: course.name,
            };
            CoreNavigator.navigateToSitePath('/CqOfflineCourse/index', {
                params: stateParams,
                preferCurrentTab: false,
            });
        }
        else
        {
            this.CH.log("course media is not defined");
        }
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
}
