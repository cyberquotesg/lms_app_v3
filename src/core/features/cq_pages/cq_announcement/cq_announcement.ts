// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { AddonNotifications } from '@features/cq_pages/cq_notifications/services/notifications';

@Component({
    selector: 'cq_announcement',
    templateUrl: './cq_announcement.html',
})
export class CqAnnouncement extends CqPage implements OnInit
{
    pageParams: any = {
        discussion_id: 0,
        notification_id: 0,
    };
    pageDefaults: any = {
        announcement: [],
    };
    pageJob: any = {
        announcement: 0,
    };

    private agent: any;
    loading: any = false;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform,
        private transfer: FileTransfer,
        private file: File,
        private fileOpener: FileOpener)
    {
        super(renderer, CH);

        this.CH.updateCount("announcement");
    }

    ngOnInit(): void {
        this.usuallyOnInit(() => {
            if (this.pageParams.notification_id)
            {
                this.CH.log("marking notification as read", this.pageParams.notification_id);
                AddonNotifications.markNotificationRead(this.pageParams.notification_id);
            }
        });
    }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    announcement(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                announcement: {
                    cluster: "CqLib",
                    endpoint: "get_announcement",
                    discussion_id: this.pageParams.discussion_id,
                },
                setRead: {
                    cluster: "CqLib",
                    endpoint: "read_announcement",
                    discussion_id: this.pageParams.discussion_id,
                },
            },
        };
        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            this.pageData.announcement = allData.announcement;
            this.pageData.announcement.messageArray = this.handleMessage(this.pageData.announcement.message);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    handleMessage(message: string): string[]
    {
        let messageArray: any[] = [];
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
    downloadAttachment(name: string, url: string): void
    {
        this.CH.loading('Downloading', (loading) => {
            const fileTransfer: FileTransferObject = this.transfer.create();
            fileTransfer.download(this.CH.config().siteurl + url, this.file.dataDirectory + name)
            .then((entry) => {
                this.fileOpener.open(entry.toURL(), this.CH.getMimeTypeByName(name))
                .then(() => {
                    loading.dismiss();
                })
                .catch((openError) => {
                    loading.dismiss();
                    this.CH.errorLog("open attachment error", {name, url, error: openError});
                    this.CH.alert('Oops!', 'Failed to open the file');
                });
            }, (downloadError) => {
                loading.dismiss();
                this.CH.errorLog("download attachment error", {name, url, error: downloadError});
                this.CH.alert('Oops!', 'Failed to download the file');
            });
        });
    }
}
