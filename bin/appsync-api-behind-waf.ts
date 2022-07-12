#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';

import { AppsyncAPI } from '../lib/appsync-api'
import { WebAppFirewall } from '../lib/web-app-firewall'

const app = new App();

const appSync = new AppsyncAPI(app, 'Backend');

new WebAppFirewall(app, 'Firewall', {
    apiArn: appSync.api.attrArn,
});