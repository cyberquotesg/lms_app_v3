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

import { AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChange } from '@angular/core';
import { CoreLogger } from '@singletons/logger';
import { Http } from '@singletons';
import { CoreConstants } from '@/core/constants';
import { CorePromisedValue } from '@classes/promised-value';

/**
 * Directive to enable font-awesome 6.3 as ionicons.
 * Check available icons at https://fontawesome.com/search?o=r&m=free
 *
 * Example usage:
 *
 * <ion-icon name="fas-icon">
 */
@Directive({
    selector: 'ion-icon[name]',
})
export class CoreFaIconDirective implements AfterViewInit, OnChanges {

    /**
     * Object used to store whether icons exist or not during development.
     */
    private static readonly DEV_ICONS_STATUS: Record<string, Promise<boolean>> = {};

    protected static aliases?: CorePromisedValue<Record<string, string>>;

    @Input() name = '';

    protected element: HTMLElement;

    protected logger: CoreLogger;

    constructor(el: ElementRef) {
        this.element = el.nativeElement;
        this.logger = CoreLogger.getInstance('CoreFaIconDirective');
    }

    /**
     * Detect icon name and use svg.
     */
    async setIcon(): Promise<void> {
        let library = '';
        let iconName = this.name;
        let font = 'ionicons';
        const parts = iconName.split('-', 2);
        if (parts.length === 2) {
            switch (parts[0]) {
                case 'far':
                    library = 'regular';
                    font = 'font-awesome';
                    break;
                case 'fa':
                case 'fas':
                    library = 'solid';
                    font = 'font-awesome';
                    break;
                case 'fab':
                    library = 'brands';
                    font = 'font-awesome';
                    break;
                case 'moodle':
                    library = 'moodle';
                    font = 'moodle';
                    break;
                case 'fam':
                    library = 'font-awesome';
                    font = 'moodle';
                    break;
                default:
                    break;
            }
        }

        if (font === 'ionicons') {
            this.element.removeAttribute('src');
            this.logger.warn(`Ionic icon ${this.name} detected`);

            return;
        }

        iconName = iconName.substring(parts[0].length + 1);

        // Set it here to avoid loading unexisting icon paths (svg/iconName) caused by the tick delay of the checkIconAlias promise.
        let src = `assets/fonts/${font}/${library}/${iconName}.svg`;
        this.element.setAttribute('src', src);

        if (font === 'font-awesome') {
            const iconNameChecked = await this.checkIconAlias(iconName);
            if (iconNameChecked !== iconName) {
                src = `assets/fonts/${font}/${library}/${iconName}.svg`;
                this.element.setAttribute('src', src);
            }
        }

        this.element.classList.add('faicon');
        this.validateIcon(this.name, src);

    }

    /**
     * @inheritdoc
     */
    ngAfterViewInit(): void {
        if (!this.element.getAttribute('aria-label') &&
            !this.element.getAttribute('aria-labelledby') &&
            this.element.getAttribute('aria-hidden') !== 'true') {
            this.logger.warn('Aria label not set on icon ' + this.name, this.element);

            this.element.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * @inheritdoc
     */
    ngOnChanges(changes: { [name: string]: SimpleChange }): void {
        if (!changes.name || !this.name) {
            return;
        }

        this.setIcon();
    }

    /**
     * Check icon alias and returns the new icon name.
     *
     * @param iconName Icon name.
     * @returns New icon name.
     */
    protected async checkIconAlias(iconName: string): Promise<string> {
        const aliases = await CoreFaIconDirective.getIconsAliases();

        if (aliases[iconName]) {
            this.logger.error(`Icon ${iconName} is an alias of ${aliases[iconName]}, please use the new name.`);

            return aliases[iconName];
        }

        return iconName;
    }

    /**
     * Read the icon aliases json file.
     *
     * @returns Promise resolved when loaded.
     */
    protected static async getIconsAliases(): Promise<Record<string, string>> {
        if (CoreFaIconDirective.aliases !== undefined) {
            return CoreFaIconDirective.aliases;
        }

        CoreFaIconDirective.aliases = new CorePromisedValue();

        try {
            const aliases = await Http.get<Record<string, string>>('assets/fonts/font-awesome/aliases.json', {
                responseType: 'json',
            }).toPromise();

            if (typeof aliases == "undefined") throw new Error("aliases is undefined");

            CoreFaIconDirective.aliases.resolve(aliases);

            return aliases;
        } catch {
            CoreFaIconDirective.aliases.resolve({});

            return {};
        }
    }

    /**
     * Validate that an icon exists, or show warning otherwise (only in development and testing environments).
     *
     * @param name Icon name.
     * @param src Icon source url.
     */
    private validateIcon(name: string, src: string): void {
        if (!CoreConstants.BUILD.isDevelopment && !CoreConstants.BUILD.isTesting) {
            return;
        }

        if (!(src in CoreFaIconDirective.DEV_ICONS_STATUS)) {
            CoreFaIconDirective.DEV_ICONS_STATUS[src] = Http.get(src, { responseType: 'text' })
                .toPromise()
                .then(() => true)
                .catch(() => false);
        }

        // eslint-disable-next-line promise/catch-or-return
        CoreFaIconDirective.DEV_ICONS_STATUS[src].then(exists => {
            if (exists) {
                return;
            }

            return this.logger.error(`Icon ${name} not found`);
        });
    }

}
