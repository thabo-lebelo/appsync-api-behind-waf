#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { AppsyncApiBehindWafStack } from '../lib/appsync-api-behind-waf-stack';

import { AppsyncAPI } from '../lib/appsync-api'
import { WebAppFirewall } from '../lib/web-app-firewall'

// const app = new cdk.App();
// new AppsyncApiBehindWafStack(app, 'AppsyncApiBehindWafStack', {
//     stackName: "appsync-api-behind-waf ",
//     description: "Deploying an AWS AppSync API with WAF using CDK v2"
// });

function createCloudFormation(): void {
    const app = new App();

    const appSync = new AppsyncAPI(app, 'Backend');

    new WebAppFirewall(app, 'Firewall', {
        apiArn: appSync.api.attrArn,
    });
}

createCloudFormation();