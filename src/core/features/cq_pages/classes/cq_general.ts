// done v3

import { CqHelper } from '../services/cq_helper';

export class CqGeneral
{
    constructor(public CH: CqHelper)
    {
    }

    isProduction(): boolean
    {
        return this.CH.isProduction();
    }
    isDevelopment(): boolean
    {
        return !this.CH.isProduction();
    }
    asIf(result?: boolean): boolean
    {
        return !!result;
    }

    toTitle(text: string): string
    {
        text = text.replace(/\-/g, ' ').replace(/_/g, ' ');
        return this.CH.capitalize(text);
    }
    toHumanText(text: string): string
    {
        return this.CH.toHumanText(text);
    }
    toArray(data: any): any[]
    {
        return this.CH.toArray(data);
    }
    getLetter(text: string): string
    {
        return this.CH.getLetter(text);
    }

    /**
     * Stop event default and propagation.
     *
     * @param event Event.
     */
    stopBubble(event: Event): void
    {
        event.preventDefault();
        event.stopPropagation();
    }
    openInBrowser(url: string): void
    {
        this.CH.openInBrowser(url);
    }

    isEmpty(data: any): boolean
    {
        return this.CH.isEmpty(data);
    }
    isAvailable(data: any): boolean
    {
        return this.CH.isAvailable(data);
    }

    sanitizeHTML(text: string): string
    {
        return this.CH.sanitizeHTML(text);
    }
    ellipsisAfter(text: string, count: number): string
    {
        return this.CH.ellipsisAfter(text, count);
    }
    s(value: number): string
    {
        return Number(value) > 1 ? 's' : '';
    }
    beautifulNumber(value: number): string
    {
        return this.CH.beautifulNumber(value);
    }
    time24To12(time: any, withPoints?: boolean): string
    {
        return this.CH.time24To12(time, withPoints);
    }
    timeRemoveSeconds(time: string): string
    {
        return this.CH.timeRemoveSeconds(time);
    }

    simpleLoading(content: string): void
    {
        this.CH.loading(content);
    }
    simpleToast(message: string): void
    {
        this.CH.toast(message);
    }
    simpleAlert(title: string, message: string): void
    {
        this.CH.alert(title, message);
    }

    alert(message: string): void
    {
        this.CH.alert("cq alert", message);
    }
}
