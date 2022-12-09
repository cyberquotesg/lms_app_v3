// not done v3

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, ToastController, AlertController, ActionSheetController, ActionSheetButton, ModalController } from '@ionic/angular';
import { CoreUserProvider } from '@features/user/services/user';
import { CoreCoursesProvider } from '@features/courses/services/courses';
import { CoreCourseHelperProvider } from '@features/course/services/course-helper';
import { CoreDomUtilsProvider } from '@services/utils/dom';
import { CoreUtilsProvider } from '@services/utils/utils';
import { CoreSiteBasicInfo, CoreSites } from '@services/sites';
import { CoreConstants } from '@/core/constants';

@Injectable({ providedIn: 'root' })
export class CqHelper
{
    notificationCount: number = 0;

	constructor(
	    @Inject(DOCUMENT) public document: Document,
		protected http: HttpClient,
	    private sanitizer: DomSanitizer,
	    public loadingController: LoadingController,
	    public toastController: ToastController,
	    public alertController: AlertController,
	    public actionSheetController: ActionSheetController,
	    public modalController: ModalController,
	    private userProvider: CoreUserProvider,
	    private coursesProvider: CoreCoursesProvider,
	    private courseHelperProvider: CoreCourseHelperProvider,
		private domUtils: CoreDomUtilsProvider,
	    private utils: CoreUtilsProvider,
	)
	{
	}

    config(): any
    {
    	return CoreConstants.CONFIG;
    }
    log(data1: any, data2?: any): void
    {
    	if (this.config().isProduction) return;

    	if (typeof data2 == 'undefined') console.log('cq - ' + data1);
    	else console.log('cq - ' + data1, data2);
    }

    async loading(message: string, callback?: (any) => void): Promise<any>
    {
        const loading = await this.loadingController.create({message});
        return await loading.present().then(() => {
        	if (callback) callback(loading);
        });
    }
    async toast(message: string, duration: number = 5000): Promise<any>
    {
        const toast = await this.toastController.create({message, duration});
        return await toast.present();
    }
    /*
     * firstButton or secondButton can follow this format
	 *	{
	 *		text: 'Cancel',
	 *      role: 'cancel',
	 *      handler: () => {
	 *      	console.log('Cancel clicked');
	 *      }
	 *	}
    */
    async alert(header: string, message: string, firstButton?: any, secondButton?: any): Promise<any>
    {
    	let buttons: any[] = [];
    	if (!firstButton) buttons.push("Ok");
    	else
    	{
    		if (firstButton) buttons.push(firstButton);
    		if (secondButton) buttons.push(secondButton);
    	}

        const alert = await this.alertController.create({header, message, buttons});
        return await alert.present();
    }
    /*
     * buttons can follow this format
	 *	[{
	 *		text: 'Share',
	 *      role: 'share',
	 *      icon: 'share',
	 *      handler: () => {
	 *      	console.log('Share clicked');
	 *      }
	 *	},
	 *	{
	 *		text: 'Favorite',
	 *      role: 'favorite',
	 *      icon: 'heart',
	 *      handler: () => {
	 *      	console.log('Favorite clicked');
	 *      }
	 *	}]
    */
    async choose(header: string, buttons?: any[]): Promise<any>
    {
    	let actionButtons: ActionSheetButton[] = [];
    	if (buttons) buttons.forEach((b) => {
    		let temp: ActionSheetButton = b;
    		actionButtons.push(temp);
    	});

    	const choose = await this.actionSheetController.create({header, buttons: actionButtons});
    	return await choose.present();
    }
    async modal(component: any, componentProps?: any, callback?: (any) => void): Promise<any>
	{
		if (typeof componentProps == 'undefined') componentProps = {};
		let modal = await this.modalController.create({component, componentProps});
		modal.onDidDismiss().then((data) => {
			if (callback) callback(data.data);
		});
		return await modal.present();
    }
    dismissModal(data?: any): void
    {
    	if (typeof data == "undefined") data = {};
    	this.modalController.dismiss(data);
    }

	filterListByName(list: any[], name: string): any
	{
	    var result = Array.isArray(list) ? [] : {},
	    	i, thisName;

	    name = name.toLowerCase();

	    for (i in list)
	    {
	    	if (typeof list[i].fullname_trimmed != 'undefined') thisName = list[i].fullname_trimmed.toLowerCase();
	    	else if (typeof list[i].fullname != 'undefined') thisName = list[i].fullname.toLowerCase();
	    	else if (typeof list[i].name != 'undefined') thisName = list[i].name.toLowerCase();
	    	else if (typeof list[i].title != 'undefined') thisName = list[i].title.toLowerCase();
	    	else continue;

	        if (thisName.includes(name)) result[i] = list[i];
	    }

	    return result;
	}
	readQRCode(data: string): string[]
	{
	    if (data.split('|').length == 1)
	    {
		    data = atob(data);
		    data = atob(data.substr(0, 10) + data.substr(11));
	    }

	    return data.split('|');
	}

    multipleToSingle(text: string, target: string): string
    {
        while (text.indexOf(target + target) > -1)
        {
        	text = text.replace(target + target, target);
        }

        return text;
    }
	sanitizeHTML(text: string): string
	{
		return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '').trim();
	}
	capitalize(text: string): string
	{
		let textArray = text.split(" ");

		textArray.forEach((value: string, index: number) => {
			textArray[index] = value[0].toUpperCase() + value.slice(1);
		});

		text = textArray.join(" ");

		return text;
	}
    toHumanText(text: string): string
    {
        return this.capitalize(text.replace(/_/g, ' '));
    }

    toMachineText(text: string, objective: string = "_"): string
    {
        let targets = [" ", "/", "\\", ",", ".", "|", "~", "`", "?", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "=", "+", "-", "[", "]", "{", "}", ";", ":", "'", '"', "<", ">"];

        targets.forEach((target) => {
            text = text.split(target).join(objective);
        });

        text = this.multipleToSingle(text, objective);
        text = text.toLowerCase();
        
        return text;
    }
    toCamelCase(text: string): string
    {
    	text = this.toMachineText(text);
    	return text.split("_").map((t, i) => !i ? t : t[0].toUpperCase() + t.substr(1)).join("");
    }
    camelToHumanText(text: string): string
    {
    	return this.toHumanText(text.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
    }
	ellipsisAfter(text: string, count: number): string
	{
		let lastCount = 0;
		let result = '';
		let ellipsisNeeded = false;

		text.trim().split(' ').forEach((t) => {
			if (lastCount) t = ' ' + t;
			lastCount += t.length;

			// put ellipsis
			if (lastCount > count) ellipsisNeeded = true;

			// insert
			else result += t;
		});

		if (ellipsisNeeded) result += '...';

		return result;
	}
	time24To12(time: any, withPoints?: boolean): string
	{
	    // prepare some variables
	    var totalTime = 0,
	        comparatorTime = 12 * 60 * 60 * 1000,
	        originalTime = time,
	        i: any, t: any;

	    // prepare the time to suitable format
	    if (typeof time == 'number') time = [time];
	    else time = time.split(':');

	    // check for am / pm
	    for (i in time)
	    {
	        // if the data is not suitable for convertion, then return back as it is
	        // otherwise, it is good to go
	        if (isNaN(time[i])) return originalTime;
	        else t = time[i];

	        if (i <= 3) t *= 1;
	        if (i <= 2) t *= 1000;
	        if (i <= 1) t *= 60;
	        if (i <= 0) t *= 60;

	        totalTime += t;
	    }

	    // turn the format back
	    time[0] = time[0] % 12 || time[0];
	    time = time.map((value) => {
            return this.beautifulNumber(value);
        }).join(':');

	    // prepare final result
	    if (withPoints)
	    {
	        if (totalTime < comparatorTime) return time + ' a.m.';
	        else return time + ' p.m.';
	    }
	    else
	    {
	        if (totalTime < comparatorTime) return time + ' am';
	        else return time + ' pm';
	    }
	}
	time24To12Batch(data: string): string
	{
	    return data.split(' ').map((text) => {
	        return text.indexOf(':') === -1 ? text : this.time24To12(text);
	    }).join(' ');
	}
    timeRemoveSeconds(time: string): string
    {
        let timeComponents = time.split(':');
        let timeFinal = '';

        if (timeComponents[0]) timeFinal += this.beautifulNumber(timeComponents[0]) + ':';
        else timeFinal += '00:';

        if (timeComponents[1]) timeFinal += this.beautifulNumber(timeComponents[1]);
        else timeFinal += '00';

        return timeFinal;
    }
	beautifulNumber(value: any): string
	{
        value = Number(value);

		if (value < 10) return '0' + value;
		else return String(value);
	}

	secureWithRecaptchaOrToken(name: string, callback: (captchaOrToken: string) => void): void
	{
	    if (this.config().catpchaOrToken == 'captcha') this.getRecaptcha(name, callback);
	    else if (this.config().catpchaOrToken == 'token') this.requestToken(name, callback);
	}
	// warning! recaptcha is not ready
	getRecaptcha(action: string, callback: (captchaOrToken: string) => void): void
	{
	    // grecaptcha.ready(() => {
	    //     grecaptcha.execute(this.config().recaptchaSiteKey, {action}).then((captcha) => {
	    //        if (typeof callback == 'function') callback(captcha);
	    //     });
	    // });

	    if (typeof callback == 'function') callback('');
	}
	requestToken = function(tokenName: string, callback: (captchaOrToken: string) => void): void
	{
		var saltIndexes = [1, 4, 5, 8, 9];
	    var salt = Math.random().toString(36).substr(2, saltIndexes.length);
	    var saltIterator = -1;

	    // the salt must be sent to server to generate token
	    this.http.get(this.config().siteurl + '/cq_lib/call.php?function=request_token&params[]=300&params[]=' + salt, {
	    	observe: 'body', responseType: 'text'
    	}).subscribe((data) => {
	        // after token has been received, it contains some salt within
	        // but the salt is inserted into the token once more in some indexes
	        // so in this step, the token has salt twice, once is mixed by server, once is mixed by app
	        var token = data.split('').map((text, index) => {
	            if (saltIndexes.indexOf(index) > -1)
	            {
	                saltIterator++;
	                return text + salt[saltIterator];
	            }
	            else return text;
	        }).join('');

	        if (typeof callback == 'function') callback(token);
	    });
	}

	// warning! this method can only be used for 2 level jobs and no duplicated job name
	setPageJobNumbers(pageJobs: any[], jobName: string, value: number): void
	{
		if (typeof pageJobs[jobName] == 'object') pageJobs[jobName].value = value;
		else
		{
		    let jobFound = false;
		    for (let i in pageJobs)
		    {
		        if (typeof pageJobs[i] != 'object') continue;
		        if (typeof pageJobs[i].next[jobName] == 'undefined') continue;

		        pageJobs[i].next[jobName] = value;
		        jobFound = true;
		        break;
		    }

		    if (!jobFound) pageJobs[jobName] = value;
		}
	}
	getPageJobNumbers(pageJobs: any[]): number[]
	{
		var numbers: any[] = [];
		for (let job in pageJobs)
		{
			if (typeof pageJobs[job] == 'object')
			{
				numbers.push(pageJobs[job].value);
				let temp = this.getPageJobNumbers(pageJobs[job].next);
				numbers = numbers.concat(temp);
			}
			else
			{
				numbers.push(pageJobs[job]);
			}
		}

		return numbers;
	}

    /*
     * list: contains result for each api call, like [0, 0, 1, -1]
     * summary: the lowest number in list, for quick consideration
     * final: the final result, whether all apis are okay or not
     * done: the call completion, whether all apis have been called or not
    */
    calculatePageStatus(numbers: number[]): any
    {
    	var error = 0, idle = 0, success = 0, n,
    		result: any = {
    			list: [],
    			summary: 0,
    			final: false,
    			done: false
    		};

    	for (n of numbers)
    	{
    		if (n == -1) error++;
    		else if (n == 0) idle++;
    		else if (n == 1) success++;
    		else continue;

    		result.list.push(n);
    	}

    	result.summary = error > 0 ? -1 : idle > 0 ? 0 : success > 0 ? 1 : numbers.length > 0 ? 0 : 1;
    	result.final = result.summary == 1;
    	result.done = idle == 0;

    	// this.log('numbers', numbers);
    	// this.log('status number', resultNumber);
    	// this.log('status', result);

    	return result;
    }
    /*
     * ok if only all apis have been called
    */
    handlePageStatus(numbers: number[]): Promise<any>
    {
    	return new Promise((ok, ko) => {
    		var status = this.calculatePageStatus(numbers);

    		if (status.done) ok(status);
    		else ko(status);
    	});
    }

    getFiltered(data: any, filter: string, fieldsToCheck?: string): any[]
    {
    	if (this.isEmpty(filter)) return data;

        const showLog = false;
    	const defaultFieldsToCheck = [
    		'name',
    		'title',
    		'displayname',
    		'fullname_trimmed',
    		'fullname',
    		'shortname',
    		'coursename',
            'contexturlname',
            'subject',
    	];
        let filteredData: any[] = [];
        filter = filter.toLowerCase();

        let fieldsToCheckArray: any[] = [];
        if (fieldsToCheck) fieldsToCheckArray = this.toArray(fieldsToCheck);

        if (showLog) this.log('getFiltered start getFiltered');
        for (let i in data)
        {
            if (showLog) this.log('getFiltered filtering data', data[i]);
        	for (let field of defaultFieldsToCheck)
        	{
                if (showLog) this.log('getFiltered checking in this field', field);
        		if (fieldsToCheckArray.length && fieldsToCheckArray.indexOf(field) == -1) continue;

        		if (typeof data[i][field] != 'undefined' && data[i][field].toLowerCase().includes(filter))
        		{
                    if (showLog) this.log('getFiltered found!');
        			filteredData.push(data[i]);
        			break;
        		}

                if (showLog) this.log('getFiltered NOT found!');
        	}
        }
        if (showLog) this.log('getFiltered end getFiltered');

        // this.log('data', data);
        // this.log('filteredData', filteredData);

        return filteredData;
    }
    getFilteredData(items: any, filterText: string, filterMultiple: any[]): any[]
    {
        const showLog = false;
        items = this.toArray(items);

        if (!this.isEmpty(filterText))
        {
            items = this.getFiltered(items, filterText);
        }

        if (!this.isEmpty(filterMultiple))
        {
            if (showLog) this.log('getFilteredData - start getFilteredData');

            for (let index in filterMultiple)
            {
                let filter = filterMultiple[index];
                let fieldsToCheck = this.toArray(filter.fieldsToCheck);

                // compile true options first
                let trueOptions: any[] = [];
                for (let index in filter.options)
                {
                    if (filter.options[index].selected) trueOptions.push(filter.options[index].value);
                }

                if (showLog)
                {
                    this.log('getFilteredData - checking this filter:', filter);
                    this.log('getFilteredData - trueOptions for this filter:', trueOptions);
                }

                let newItems: any[] = [];
                for (let index in items)
                {
                    let item = items[index];
                    if (showLog) this.log('> getFilteredData - checking this item:', item);

                    fieldsToCheck.forEach((fieldToCheck) => {
                        if (showLog) this.log('>> getFilteredData - checking this field:', fieldToCheck);

                        if (typeof item[fieldToCheck] == 'undefined')
                        {
                            if (showLog) this.log('>> getFilteredData - fieldToCheck is not found on item');
                            return;
                        }
                        else
                        {
                            if (showLog) this.log('>> getFilteredData - fieldToCheck is found');

                            trueOptions.forEach((trueOption) => {
                                if (showLog) this.log('>>> getFilteredData - checking this option:', trueOption);

                                if (typeof trueOption == 'undefined')
                                {
                                    if (typeof item[fieldToCheck] == 'undefined' || item[fieldToCheck] === null || item[fieldToCheck] === '')
                                    {
                                        if (showLog) this.log('>>> getFilteredData - not set!');
                                    }
                                    else
                                    {
                                        if (showLog) this.log('>>> getFilteredData - NOT match!');
                                        return;
                                    }
                                }
                                else
                                {
                                    if (trueOption == item[fieldToCheck])
                                    {
                                        if (showLog) this.log('>>> getFilteredData - match!');
                                    }
                                    else
                                    {
                                        if (showLog) this.log('>>> getFilteredData - NOT match!');
                                        return;
                                    }
                                }

                                // final check
                                if (this.isItemFoundByCriteria(newItems, 'id', item.id))
                                {
                                    if (showLog) this.log('>>> item already exists, skipping');
                                    return;
                                }
                                else
                                {
                                    if (showLog) this.log('>>> item doesn\'t exist, adding');
                                    newItems.push(item);
                                }
                            });
                        }
                    });
                }
                items = newItems;
            }
            if (showLog) this.log('getFilteredData - end getFilteredData');
        }

        return items;
    }
    getItemByCriteria(data: any, field: string, value: any, useStrict?: boolean): any
    {
        for (let i in data)
        {
            if ((useStrict && data[i][field] === value) || (!useStrict && data[i][field] == value))
            {
                return data[i];
            }
        }

        return null;
    }
    isItemFoundByCriteria(data: any, field: string, value: any, useStrict?: boolean): any
    {
        for (let i in data)
        {
            if ((useStrict && data[i][field] === value) || (!useStrict && data[i][field] == value))
            {
                return true;
            }
        }

        return false;
    }

    cloneJson(data: any): any
    {
    	return JSON.parse(
    		JSON.stringify(
    			data
    		)
    	);
    }
    isJsonString(data: any): boolean
    {
    	if (typeof data != 'string') return false;

        try
        {
            JSON.parse(data);
        }
        catch (e)
        {
            return false;
        }

        return true;
    }
    isJsonObject(data: any): boolean
    {
    	if (typeof data != 'object') return false;
    	else if (data === null) return false;
    	else return true;
    }
    toJson(data: any, force?: boolean): any
    {
    	if (this.isJsonString(data)) return JSON.parse(data);
    	else if (this.isJsonObject(data)) return data;
    	else if (force) return {};
    	else return data;
    }
    toArray(data: any): any[]
    {
    	if (Array.isArray(data)) return data;
    	if (typeof data == 'string') return data.replace(/ /g, '').split(',');

    	let dataArray: any[] = [];
        for (let id in data)
        {
        	dataArray.push(data[id]);
        }

        return dataArray;
    }
    collectFromJson(data: any[], target: string): any[]
    {
    	let bucket: [] = [];
    	data.forEach((item) => {
    		bucket.push(item[target]);
    	});

    	return bucket;
    }

    getLength(data: any, justCheck?: boolean): number
    {
      if (!data) return 0;

      if (Array.isArray(data)) return data.length;
      else
      {
        var dataLength = 0;
        for (var i in data)
        {
        	dataLength++;
        	if (justCheck) return dataLength;
        }
        return dataLength;
      }
    }
    getLetter(text: string): string
    {
    	return text.substr(0, 1);
    }
    isEmpty(data: any): boolean
    {
      return (
        !data ||
        typeof data == "undefined" ||
        data === false || 
        data === null || 
        data === 0 || 
        data === "" || 
        data === "0" || 
        (Array.isArray(data) && !data.length) ||
        (typeof data == "object" && !this.getLength(data, true))
      );
    }
    isAvailable(data: any): boolean
    {
        return !this.isEmpty(data);
    }
    openInBrowser(url: string): void
    {
        this.utils.openInBrowser(url);
    }
    getColors(index: number): string
    {
    	let colors = [
    		'#00a8ff',
    		'#9c88ff',
    		'#fbc531',
    		'#4cd137',
    		'#487eb0',
    		'#e84118',
    		'#7f8fa6',
    		'#273c75',
    		'#353b48',
    		'#f368e0',
    		'#00d2d3',
    	];
    	let realIndex = index % colors.length;

        return colors[realIndex];
    }

    /* ============================================================================================= api related helpers
    */

    /* call fake api, usefull for testing new page without really having the actual api
     * executer: no
     * apiName and data can be anything, both are not really used
    */
    callNoApi(apiName: string, data?: any): Promise<any>
    {
    	return new Promise((ok, ko) => {
    		ok(data);
    	});
    }
    callApi(params: any): Promise<any>
    {
    	const url = this.config().siteurl + '/cq_lib/call.php';
		const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    	// make sure wstoken is included at the end of sent data
    	if (!params.wstoken && this.getSite() && this.getWsToken())
    	{
	    	params.wstoken = this.getWsToken();
    	}

    	// api version
    	params.api_version = "2.0";
		
    	return this.http.post(url, params, {headers, responseType: 'text'}).toPromise();
    }

    translateTime(unixtimestamp: number): any
    {
        var data: any = {
                startInDays: 0,
                startInHours: 0,
                startInMinutes: 0,
                startInSeconds: 0,
                will_start_in: 0,
                timeUrgency: 0,
            },
            remainingWillStartIn: number,
            dividerWillStartIn: number;

        // Remaining days
        remainingWillStartIn = unixtimestamp;
        dividerWillStartIn = 60 * 60 * 24;
        data.startInDays = Math.floor(remainingWillStartIn / dividerWillStartIn);

        // Remaining hours
        remainingWillStartIn = remainingWillStartIn % dividerWillStartIn;
        dividerWillStartIn = 60 * 60;
        data.startInHours = Math.floor(remainingWillStartIn / dividerWillStartIn);

        // Remaining minutes
        remainingWillStartIn = remainingWillStartIn % dividerWillStartIn;
        dividerWillStartIn = 60;
        data.startInMinutes = Math.floor(remainingWillStartIn / dividerWillStartIn);

        // Remaining seconds
        remainingWillStartIn = remainingWillStartIn % dividerWillStartIn;
        data.startInSeconds = remainingWillStartIn;

        // Modify the data if all are 0
        if (data.startInDays == 0 && data.startInHours == 0 && data.startInMinutes == 0 && data.startInSeconds == 0)
        {
            data.will_start_in = 0;
        }
        else
        {
            data.will_start_in = unixtimestamp;
        }

        // Time urgency
        if (data.will_start_in == 0)
        {
            data.timeUrgency = 1;
        }
        else if (data.will_start_in < (60 * 60 * 24))
        {
            data.timeUrgency = 2;
        }
        else if (data.will_start_in < (60 * 60 * 24 * 3))
        {
            data.timeUrgency = 3;
        }
        else if (data.will_start_in < (60 * 60 * 24 * 7))
        {
            data.timeUrgency = 4;
        }
        else
        {
            data.timeUrgency = 5;
        }

        return data;
    }
    byPassHTML(text: string): any
    {
    	return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    getMimeTypeByName(name: any): string
    {
        let mimeTypes = {
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            png: 'image/png',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            gif: 'image/gif',
            pdf: 'application/pdf',
        };
        let extention = name.split('.').pop();

        if (mimeTypes[extention]) return mimeTypes[extention];
        else return "";
    }

    setNotificationCount(value: number): void
    {
        this.notificationCount = value;
    }
    getNotificationCount(): number
    {
        return this.notificationCount;
    }

    getSite(): any
    {
        return CoreSites.getCurrentSite();
    }
    isLoggedIn(): boolean
    {
    	return CoreSites.isLoggedIn();
    }
    logout(): Promise<void>
    {
    	return CoreSites.logout();
    }
    // warning! deprecated
    getSites(): Promise<CoreSiteBasicInfo[]>
    {
        return CoreSites.getSites();
    }

    getSiteId(): string
    {
        return this.getSite().getId();
    }
    getSiteHomeId(): number
    {
    	return this.getSite().getSiteHomeId();
    }
    getUserId(): number
    {
    	return this.getSite().getUserId();
    }
    getWsToken(): string
    {
    	return this.getSite().getToken();
    }

    getUser(): CoreUserProvider
    {
        return this.userProvider;
    }
    getCourses(): CoreCoursesProvider
    {
        return this.coursesProvider;
    }
    getCourseHelper(): CoreCourseHelperProvider
    {
        return this.courseHelperProvider;
    }
    getBody(): any
    {
        return this.document.body;
    }

    getCountryOrganizationData(): any
    {
        const tempC = localStorage.getItem('cqCountry');
        const tempO = localStorage.getItem('cqOrganization');
        const cssVars: string[] = [];

        if (tempC == null || tempO == null)
        {
            return {
                result: false,
                cqCountry: tempC != null,
                cqOrganization: tempO != null,
                cssVars,
            };
        }
        else
        {
            const cqCountry = JSON.parse(tempC);
            const cqOrganization = JSON.parse(tempO);

            // Set cssVars
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
            properties.forEach((property) => {
                if (this.isEmpty(cqOrganization[property]) || cqOrganization[property] == 'null') return;

                let cssVar = '';

                if (property != 'mobileBackgroundImage') cssVar = '--' + property + ': #' + cqOrganization[property];
                else cssVar = '--' + property + ': url(\'/assets/img/background/' + cqOrganization[property] + '\')';

                // this.log('cssVar', cssVar);
                cssVars.push(cssVar);
            });

            return {
                result: true,
                cqCountry: cqCountry,
                cqOrganization: cqOrganization,
                cssVars,
            };
        }
    }

    sortCoursesByStartDateTime(courses: any[]): any[]
    {
        courses.sort((c1, c2) => {
            if (c1.will_start_in != c2.will_start_in)
            {
                return c1.will_start_in > c2.will_start_in ? 1 : -1;
            }
            else
            {
                let c1Name = (c1.name || c1.fullname_trimmed || c1.fullname).toLowerCase().trim();
                let c2Name = (c2.name || c2.fullname_trimmed || c2.fullname).toLowerCase().trim();
                return c1Name > c2Name ? 1 : c1Name == c2Name ? 0 : -1;
            }
        });
        
        return courses;
    }

    toggleDrawer(): void {
    	// warning! events is removed from ionic 5
        // this.events.publish('toggleDrawer');
    }
    goToNotificationsList(): void {
    	// warning! events is removed from ionic 5
        // this.events.publish('goToNotificationsList');
    }
}
