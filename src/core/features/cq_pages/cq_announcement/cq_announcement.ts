// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Component({
    selector: 'cq_announcement',
    templateUrl: './cq_announcement.html',
})
export class CqAnnouncement extends CqPage implements OnInit
{
    pageParams: any = {
        discussion_id: 0,
    };
    pageDefaults: any = {
        announcement: [],
    };
    pageJob: any = {
        announcement: 0,
    };

    private agent: any;
    private loading: any = false;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform)
    {
        super(renderer, CH);
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    announcement(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: "CqLib",
            function: "get_announcement",
            discussion_id: this.pageParams.discussion_id,
        };
        this.pageJobExecuter(jobName, params, (data) => {
            this.pageData.announcement = this.CH.toArray(this.CH.toJson(data));
            this.pageData.announcement.messageArray = this.handleMessage(this.pageData.announcement.message);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    handleMessage(message: string): string[]
    {
        let messageArray = [];
        message
            .replace(/\&gt;/g, '>')
            .replace(/\&lt;/g, '<')

            .replace(/<a /ig, '<a ')
            .replace(/<a>/ig, '<a>')
            .replace(/<\/a>/ig, '</a>')

            .replace(/<iframe /ig, '<iframe ')
            .replace(/<iframe>/ig, '<iframe>')
            .replace(/<\/iframe>/ig, '</iframe>')

            .split('<iframe')
            .forEach((text) => {
                // if it is normal text, then push to message Array
                if (text.indexOf('</iframe>') == -1)
                {
                    text
                        .split('<a')
                        .forEach((t) => {
                            // if it is normal text, then push to message Array
                            if (t.indexOf('</a>') == -1)
                            {
                                messageArray.push({
                                    type: 'text',
                                    content: t,
                                });
                            }

                            // if not, then split and push both
                            else
                            {
                                let tArray = t.split('</a>');

                                messageArray.push({
                                    type: 'link',
                                    content: tArray[0].replace(/'/g, '"').split('href="')[1].split('"')[0],
                                    content2: tArray[0].replace(/'/g, '"').split('>').splice(1).join('>'),
                                });                    

                                messageArray.push({
                                    type: 'text',
                                    content: tArray[1],
                                });
                            }
                        });
                }

                // if not, then split and push both
                else
                {
                    let textArray = text.split('</iframe>');

                    messageArray.push({
                        type: 'youtube',
                        content: textArray[0].replace(/'/g, '"').split('src="')[1].split('"')[0],
                    });

                    textArray[1]
                        .split('<a')
                        .forEach((t) => {
                            // if it is normal text, then push to message Array
                            if (t.indexOf('</a>') == -1)
                            {
                                messageArray.push({
                                    type: 'text',
                                    content: t,
                                });
                            }

                            // if not, then split and push both
                            else
                            {
                                let tArray = t.split('</a>');

                                messageArray.push({
                                    type: 'link',
                                    content: tArray[0].replace(/'/g, '"').split('href="')[1].split('"')[0],
                                    content2: tArray[0].replace(/'/g, '"').split('>').splice(1).join('>'),
                                });                    

                                messageArray.push({
                                    type: 'text',
                                    content: tArray[1],
                                });
                            }
                        });
                }
            });

        this.CH.log('messageArray', messageArray);
        return messageArray;
    }
    setRead(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobExecuter(jobName, 'moodle', 'local_cq_api_read_announcement', {
            iduser: this.CH.getUserId(),
            discussionid: this.pageParams.discussion,
        }, (data) => {
            let result = this.CH.toJson(data);
            this.CH.log('result', result);
        }, moreloader, refresher, finalCallback);
    }
    downloadAttachment(name: string, url: string): void
    {
        this.CH.loading('Downloading', (loading) => {
            const fileTransfer: FileTransferObject = this.transfer.create();
            fileTransfer.download(url, this.file.dataDirectory + name)
            .then((entry) => {
                this.fileOpener.open(entry.toURL(), this.CH.getMimeTypeByName(name))
                .then(() => {
                    loading.dismiss();
                })
                .catch(() => {
                    loading.dismiss();
                    this.CH.alert('Ups!', 'Failed to open the file');
                });
            }, (error) => {
                loading.dismiss();
                this.CH.alert('Ups!', 'Failed to download the file');
            });
        });
    }
}
