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
import { CorePlatform } from '@services/platform';
import { CoreConstants } from '@/core/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { Device } from '@singletons';

@Injectable({ providedIn: 'root' })
export class CqHelper
{
    notificationBS: BehaviorSubject<number>;
    notificationNumber: Observable<number>;

    announcementBS: BehaviorSubject<number>;
    announcementNumber: Observable<number>;

    zoom: any;
    zoomInitiated: boolean = false;

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
		this.notificationBS = new BehaviorSubject<number>(0);
		this.notificationNumber = this.notificationBS.asObservable();

		this.announcementBS = new BehaviorSubject<number>(0);
		this.announcementNumber = this.announcementBS.asObservable();
	}

    config(): any
    {
    	return CoreConstants.CONFIG;
    }
    isProduction(): boolean
    {
    	return this.config().isProduction;
    }
    appVersion(): string
    {
    	return this.config().versionname;
    }
    getDeviceInfo(): any
    {
    	return {
    		appId: this.config().app_id,
    		name: Device.manufacturer || "no_manufacturer",
    		model: Device.model || "no_model",
    		platform: Device.platform || "no_platform",
    		version: Device.version || "no_version",
    		uuid: Device.uuid || "no_uuid",
    	};
    }
    getDeviceInfoString(): string
    {
    	let data: any = this.getDeviceInfo();
    	let result: string[] = [];

    	for (let key in data) result.push(data[key]);

    	return result.join("-");
    }
    log(data1: any, data2?: any): void
    {
    	if (this.isProduction()) return;

    	if (typeof data2 == 'undefined') console.log('cq - ' + data1);
    	else console.log('cq - ' + data1, data2);
    }
    errorLog(data1: any, data2?: any): void
    {
    	this.log(data1, data2);

		if (this.config().sendErrorLog)
		{
			this.callApi({
				class: "CqLib",
				function: "mobile_error_log",
				data: {
					data1, data2,
					country: this.getCountry(),
					organization: this.getOrganization(),
					platform: CorePlatform.platforms(),
					config: this.config(),
				}
			});
		}
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
	        originalTime: string = String(time),
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
	    time = time.map((value: any) => {
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
	    return data.split(' ').map((text: string) => {
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
	    this.http.get(this.config().siteurl + '/cq_lib/call.php?function=request_csrf_token&params[]=300&params[]=' + salt + "&params[]=" + this.getDeviceInfoString(), {
	    	observe: 'body', responseType: 'text'
    	}).subscribe((data) => {
    		let jsonData = this.toJson(data);
    		
	        // after token has been received, it contains some salt within
	        // but the salt is inserted into the token once more in some indexes
	        // so in this step, the token has salt twice, once is mixed by server, once is mixed by app
	        var token = jsonData.token.split('').map((text, index) => {
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
    	let bucket: any[] = [];
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
    	let targets = [" ", "/", "\\", ",", ".", "|", "~", "`", "?", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "=", "+", "-", "[", "]", "{", "}", ";", ":", "'", '"', "<", ">"];

    	targets.forEach((target) => {
    	    text = text.split(target).join("");
    	});
    	text = text.substr(0, 1).toUpperCase();
    	
    	return text;
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

    getCountry(what?: string): any
    {
    	let data = localStorage.getItem('cqCountry');

    	if (data)
    	{
    		let parsedData = JSON.parse(data);

    		if (parsedData)
    		{
	    		if (what) return parsedData[what];
	    		else return parsedData;
    		}
    		else return {};
    	}
    	else return {};
    }
    getOrganization(what?: string): any
    {
    	let data = localStorage.getItem('cqOrganization');

    	if (data)
    	{
    		let parsedData = JSON.parse(data);

    		if (parsedData)
    		{
	    		if (what) return parsedData[what];
	    		else return parsedData;
    		}
    		else return {};
    	}
    	else return {};
    }

    shortenNotificationCount(count: number): string
    {
        if (count == 0)
        {
            return '';
        }
        else if (count <= 999)
        {
            return String(count);
        }
        else if (count <= 9999)
        {
            count = Math.floor(count / 100) / 10;
            return String(count) + 'K';
        }
        else if (count <= 999999)
        {
            count = Math.floor(count / 1000);
            return String(count) + 'K';
        }
        else if (count <= 9999999)
        {
            count = Math.floor(count / 100000) / 10;
            return String(count) + 'M';
        }
        else
        {
            count = Math.floor(count / 1000000);
            return String(count) + 'M';
        }
    }

    /* ============================================================================================= api related helpers
    */

    /* call fake api, usefull for testing new page without really having the actual api
     * executer: no
     * apiName and data can be anything, both are not really used
    */
    callNoApi(anything?: any): Promise<any>
    {
    	return new Promise((ok, ko) => {
    		ok(anything);
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
        this.notificationBS.next(value);
    }
    setAnnouncementCount(value: number): void
    {
        this.announcementBS.next(value);
    }

    updateCount(target: string | string[]): void
    {
    	let targets = this.toArray(target);
    	let params: any = { calls: {} };

    	if (targets.includes("notification")) params.calls.notification = { class: "CqLib", function: "ping_notifications" };
    	if (targets.includes("announcement")) params.calls.announcement = { class: "CqLib", function: "ping_announcements" };

    	this.callApi(params).then((data) => {
    	    let allData = this.toJson(data);

    	    if (typeof allData.notification != "undefined") this.setNotificationCount(allData.notification)
    	    if (typeof allData.announcement != "undefined") this.setAnnouncementCount(allData.announcement)
    	});
    }

    getSite(): any
    {
        return CoreSites.getCurrentSite();
    }
    async getSiteConfig(): Promise<any>
    {
    	let data = CoreSites.getSitePublicConfig(this.config().siteurl);

    	return data;
    }
    isLoggedIn(): boolean
    {
    	return CoreSites.isLoggedIn();
    }
    logout(): Promise<void>
    {
    	return CoreSites.logout();
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

    initiateZoomEngine(apiKey: string, apiSecret: string): Promise<boolean>
    {
    	this.log("try to initiate zoom, apiKey", apiKey);
    	this.log("try to initiate zoom, apiSecret", apiSecret);

    	if (!CorePlatform.is('cordova'))
    	{
	    	this.log("cancel initiate zoom", "this is not cordova");
	    	return new Promise((resolve, reject) => {
	    		resolve(true);
	    	});
    	}

    	this.log("init zoom", {apiKey, apiSecret});
    	return this.zoom.initialize(apiKey, apiSecret)
    	.then((success: any) => {
    		this.log("init zoom ok", success);
    	    
    	    return true;
    	})
    	.catch((error: any) => {
    		this.errorLog("init zoom error", {apiKey, apiSecret, error});

    	    return false;
    	});
    }
    async initiateZoom(): Promise<boolean>
    {
    	if (!this.zoom) return false;
    	if (this.zoomInitiated) return true;

    	const zoomKeysParams = {
    	    class: "CqLib",
    	    function: "get_zoom_keys",
    	};
    	let data = await this.callApi(zoomKeysParams);
    	let jsonData = this.toJson(data);

    	if (jsonData.success)
    	{
    		this.log("init zoom jsonData.list", JSON.stringify(jsonData.list));
    		
    	    let initiated = false;
    	    for (let key of jsonData.list)
    	    {
    	        initiated = await this.initiateZoomEngine(key.apiKey, key.secretKey);
    	        if (initiated)
    	        {
    	    		this.zoomInitiated = true;
    	        	return true;
    	        }
    	    }

    		this.errorLog("init zoom error", {data: jsonData, error: "connection to Zoom was failed"});
			this.alert("Oops!", "Connection to Zoom was failed, please check your internet connection or contact your course administrator.");
    	}
    	else
    	{
    		this.errorLog("init zoom error", {data: jsonData, error: "organization is not connected to zoom"});
    	    this.alert("Oops!", "Your organization is not connected to zoom, please contact your course administrator.");
    	}

		this.zoomInitiated = false;
    	return false;
    }
    joinMeetingZoomEngine(meetingNumber, meetingPassword, meetingScreenName): void
    {
    	if (!this.zoom) return;
    	if (!this.zoomInitiated) return;

    	if (!CorePlatform.is('cordova'))
    	{
	    	this.log("cancel join meeting zoom", "this is not cordova");
	    	return;
    	}

    	this.log("join meeting zoom", {meetingNumber, meetingPassword, meetingScreenName});
        this.zoom.joinMeeting(meetingNumber, meetingPassword, meetingScreenName, {
            "no_driving_mode":true,
            "no_invite":true,
            "no_meeting_end_message":true,
            "no_titlebar":false,
            "no_bottom_toolbar":false,
            "no_dial_in_via_phone":true,
            "no_dial_out_to_phone":true,
            "no_disconnect_audio":true,
            "no_share":true,
            "no_audio":true,
            "no_video":true,
            "no_meeting_error_message":true
        })
        .then((success: any) => {
    		this.log("join meeting zoom ok", success);
        })
        .catch((error: any) => {
    		this.errorLog("join meeting zoom error", {meetingNumber, meetingPassword, meetingScreenName, error});
            this.alert("Oops!", "Cannot start Zoom meeting, please check your internet connection or contact your course administrator.");
        });
    }
    async joinMeetingZoom(meetingNumber, meetingPassword, meetingScreenName): Promise<void> 
    {
    	await this.initiateZoom();
    	this.joinMeetingZoomEngine(meetingNumber, meetingPassword, meetingScreenName);
    }

    /* ============================================================================================= date time
    */
	goodDecimal(value?: any): string
	{
		if (typeof value == "undefined") return "00";
		else if (typeof value != "number") value = parseInt(value);

		return value < 10 ? "0" + value : value;
	}
    getDayName(day: number): string
    {
    	day++;
    	
    	if (day == 1) return "Sun";
    	if (day == 2) return "Mon";
    	if (day == 3) return "Tue";
    	if (day == 4) return "Wed";
    	if (day == 5) return "Thu";
    	if (day == 6) return "Fri";
    	if (day == 7) return "Sat";

    	return "";
    }
    getMonthName(month: number): string
    {
    	month++;
    	
    	if (month == 1) return "Jan";
    	if (month == 2) return "Feb";
    	if (month == 3) return "Mar";

    	if (month == 4) return "Apr";
    	if (month == 5) return "May";
    	if (month == 6) return "Jun";
    	
    	if (month == 7) return "Jul";
    	if (month == 8) return "Aug";
    	if (month == 9) return "Sep";
    	
    	if (month == 10) return "Oct";
    	if (month == 11) return "Nov";
    	if (month == 12) return "Dec";

    	return "";
    }
    getMonthNumber(month: string): number
    {
    	month = month.toLowerCase();

    	if (month == "jan") return 1;
    	else if (month == "feb") return 2;
    	else if (month == "mar") return 3;

    	else if (month == "apr") return 4;
    	else if (month == "may") return 5;
    	else if (month == "jun") return 6;

    	else if (month == "jul") return 7;
    	else if (month == "aug") return 8;
    	else if (month == "sep") return 9;

    	else if (month == "oct") return 10;
    	else if (month == "nov") return 11;
    	else if (month == "dec") return 12;

    	return 0;
    }
    /* converts time like 06:40:35 to seconds
     * the seconds should not have miliseconds
    */
    timeToSecond(time: string): number
    {
    	let timeArray = time.split(":");
    	var hours = (timeArray[0] ? Number(timeArray[0]) : 0) * 60 * 60;
    	var minutes = (timeArray[1] ? Number(timeArray[1]) : 1) * 60;
    	var seconds = (timeArray[2] ? Number(timeArray[2]) : 2);

    	return hours + minutes + seconds;
    }

    getTimeDifference(time_1: string|number|Date, time_2: string|number|Date, humanTime?: boolean): number|string
    {
    	if (typeof time_1 == "string" || typeof time_1 == "number") time_1 = new Date(time_1);
    	if (typeof time_2 == "string" || typeof time_2 == "number") time_2 = new Date(time_2);

    	var difference = (time_2.getTime() - time_1.getTime()) / 1000;

    	if (humanTime) return this.getUnixTimeToHumanTime(difference);
    	else return difference;
    }
    getDayDifference(day_1: string|number|Date, day_2: string|number|Date, inclusive?: boolean, absolute?: boolean): number
    {
    	if (typeof day_1 == "string" || typeof day_1 == "number") day_1 = new Date(day_1);
    	day_1 = new Date(day_1.toDateString());

    	if (typeof day_2 == "string" || typeof day_2 == "number") day_2 = new Date(day_2);
    	day_2 = new Date(day_2.toDateString());

    	let difference = (day_2.getTime() - day_1.getTime()) / 24 / 60 / 60 / 1000;

    	if (inclusive) difference++;
    	if (absolute) difference = Math.abs(difference);

    	return difference;
    }
    getDayDifferenceInclusive(day_1: string|number|Date, day_2: string|number|Date, absolute?: boolean): number
    {
    	return this.getDayDifference(day_1, day_2, true, absolute);
    }
    /*
     * warning!
     * this function doesn't work well if the difference is inclusive
    */
    getDayDifferenceTranslated(difference: number, humanize?: boolean): string
    {
    	if (!difference)
    	{
    		if (humanize) return "same day";
    		else return "0 day";
    	}
    	else if (Math.abs(difference) == 1) return difference + " day";
    	else return difference + " days";
    }

    getSystemDate(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return the_date.getFullYear() + "-" + (the_date.getMonth() + 1) + "-" + the_date.getDate();
    }
    getSystemDateTime(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getSystemDate(the_date) + " " + 
    			this.goodDecimal(the_date.getHours()) + ":" + 
    			this.goodDecimal(the_date.getMinutes());
    }
    getHumanDay(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return this.getDayName(the_date.getDay());
    }
    getHumanDate(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.goodDecimal(the_date.getDate()) + "-" + 
    			this.goodDecimal(the_date.getMonth() + 1) + "-" + 
    			the_date.getFullYear();
    }
    getHumanTime(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.goodDecimal(the_date.getHours()) + ":" + 
    			this.goodDecimal(the_date.getMinutes());
    }
    getHumanTimeFromString(the_time?: string): string
    {
    	if (typeof the_time == "undefined") return "";
    	else return the_time.substr(0, 5);
    }

    getHumanDayDate(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDay(the_date) + " " +
    			this.getHumanDate(the_date);
    }
    getHumanDateTime(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDate(the_date) + " " + 
    			this.getHumanTime(the_date);
    }

    getHumanDayDateTime(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDayDate(the_date) + " " + 
    			this.getHumanTime(the_date);
    }

    getHumanDateWithName(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.goodDecimal(the_date.getDate()) + " " + 
    			this.getMonthName(the_date.getMonth()) + " " + 
    			the_date.getFullYear();
    }
    getHumanDayDateWithName(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDay(the_date) + " " +
    			this.getHumanDateWithName(the_date);
    }
    getHumanDateTimeWithName(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDateWithName(the_date) + " " + 
    			this.getHumanTime(the_date);
    }
    getHumanDayDateTimeWithName(the_date: string|number|Date): string
    {
    	if (typeof the_date == "string" || typeof the_date == "number") the_date = new Date(the_date);
    	return 	this.getHumanDayDateWithName(the_date) + " " + 
    			this.getHumanTime(the_date);
    }
    /*
     * unixTime is timestamp WITHOUT miliseconds
    */
    getUnixTimeToHumanTime(unixTime: number): string
    {
    	var seconds = unixTime % 60;
    	unixTime = Math.floor(unixTime / 60);

    	var minutes = unixTime % 60;
    	var hours = Math.floor(unixTime / 60);

    	return this.goodDecimal(hours) + ":" + this.goodDecimal(minutes) + ":" + this.goodDecimal(seconds);
    }
    /*
     * unixTime is timestamp WITHOUT miliseconds
    */
    getUnixTimeToHours(unixTime: number): number
    {
    	return unixTime / 60 / 60;
    }
    /*
     * unixTime is timestamp WITHOUT miliseconds
    */
    getUnixTimeToDays(unixTime: number): number
    {
    	return this.getUnixTimeToHours(unixTime) / 24;
    }
    getOneDayInMs(): number
    {
    	return 1000 * 60 * 60 * 24;
    }

    isSame(data1: any, data2: any, strict?: boolean): boolean
    {
        let type1: string = typeof data1; if (data1 == null) type1 = "null";
        let type2: string = typeof data2; if (data2 == null) type2 = "null";
        let debug = false;
     
        if (debug)
        {
        	this.log("starting isSame() function");
        	this.log("data1", data1);
        	this.log("data2", data2);
        	this.log("strict is", strict);
        }

        // types are different
        if ((type1 == "object" && type2 != "object") || (type1 != "object" && type2 == "object"))
        {
        	if (debug)
        	{
        		this.log("types are different, result is false");
        		this.log(type1 + " vs " + type2);
        		this.log("strict is", strict);
        	}
        	return false;
        }
        
        // primitive data
        else if (type1 != "object")
        {
        	let result = strict ? data1 === data2 : data1 == data2;
        	if (!result && debug)
        	{
        		this.log("data is different, result is false");
        		this.log(data1 + " vs " + data2);
        		this.log("strict is", strict);
        	}

        	return result;
        }
        
        // array
        else if (Array.isArray(data1))
        {
            // both length are different
            if (data1.length != data2.length)
            {
        		this.log("data length is different, result is false");
        		this.log(data1.length + " vs " + data2.length);
        		this.log("strict is", strict);

            	return false;
            }
            
            let index;
            for (index in data1)
            {
                if (!this.isSame(data1[index], data2[index], strict)) return false;
            }
            
            return true;
        }
        
        // object
        else
        {
            // comparing keys
            let key1 = Object.keys(data1);
            let key2 = Object.keys(data2);
            if (!this.isSame(key1, key2, strict)) return false;
            
            let key;
            for (key of key1)
            {
                if (!this.isSame(data1[key], data2[key], strict)) return false;
            }
            
            return true;
        }
    }
}
