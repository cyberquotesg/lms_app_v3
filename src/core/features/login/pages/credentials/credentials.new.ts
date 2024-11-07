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

import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CoreApp } from '@services/app';
import { CoreNetwork } from '@services/network';
import { CoreSites } from '@services/sites';
import { CoreDomUtils } from '@services/utils/dom';
import { CoreLoginHelper } from '@features/login/services/login-helper';
import { CoreNavigator } from '@services/navigator';
import { CoreForms } from '@singletons/form';
import { CoreSiteError } from '@classes/errors/siteerror';
import { CqHelper } from '@features/cq_pages/services/cq_helper';
import { CoreLoginCredentialsPage as Old } from './credentials';

/**
 * Page to enter the user credentials.
 */
@Component({
    selector: 'page-core-login-credentials-new',
    templateUrl: 'credentials.new.html',
    styleUrls: ['../../login.scss'],
})
export class CoreLoginCredentialsPage extends Old
{
    constructor(protected fb: FormBuilder, protected CH: CqHelper) {
        super(fb);
    }

    async login(e?: Event): Promise<void>
    {
        this.CH.getSiteConfig().then((publicConfig) => {
            if (publicConfig.captcha_enabled)
            {
                this.CH.getRecaptcha("login", (value) => {
                    this.loginOriginal("captcha", value, e);
                });
            }
            else if (publicConfig.csrf_token_enabled)
            {
                this.CH.requestCsrfToken("login", (value) => {
                    this.loginOriginal("csrf_token", value, e);
                });
            }
            else
            {
                this.loginOriginal("", "", e);
            }
        });
    }
    async loginOriginal(captchaOrCsrfToken: string, value: string, e?: Event): Promise<void>
    {
        e?.preventDefault();
        e?.stopPropagation();

        CoreApp.closeKeyboard();

        // Get input data.
        const siteUrl = this.site.getURL();
        const username = this.credForm.value.username;
        const password = this.credForm.value.password;

        if (!username) {
            CoreDomUtils.showErrorModal('core.login.usernamerequired', true);

            return;
        }
        if (!password) {
            CoreDomUtils.showErrorModal('core.login.passwordrequired', true);

            return;
        }

        if (!CoreNetwork.isOnline()) {
            CoreDomUtils.showErrorModal('core.networkerrormsg', true);

            return;
        }

        const modal = await CoreDomUtils.showModalLoading();

        // Start the authentication process.
        try {
            const data = await CoreSites.getUserToken(siteUrl, username, password, "", false, captchaOrCsrfToken, value);

            const id = await CoreSites.newSite(data.siteUrl, data.token, data.privateToken);

            // Reset fields so the data is not in the view anymore.
            this.credForm.controls['username'].reset();
            this.credForm.controls['password'].reset();

            this.siteId = id;

            await CoreNavigator.navigateToSiteHome({ params: { urlToOpen: this.urlToOpen } });
        } catch (error) {
            if (error instanceof CoreSiteError && CoreLoginHelper.isAppUnsupportedError(error)) {
                await CoreLoginHelper.showAppUnsupportedModal(siteUrl, this.site, error.debug);
            } else {
                CoreLoginHelper.treatUserTokenError(siteUrl, error, username, password);
            }

            if (error.loggedout) {
                CoreNavigator.navigate('/login/sites', { reset: true });
            } else if (error.errorcode == 'forcepasswordchangenotice') {
                // Reset password field.
                this.credForm.controls.password.reset();
            } else if (error.errorcode === 'invalidlogin') {
                this.loginAttempts++;
            }
        } finally {
            modal.dismiss();

            CoreForms.triggerFormSubmittedEvent(this.formElement, true);
        }
    }
}

