import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppsyncAPI } from '../lib/appsync-api';
import { WebAppFirewall } from '../lib/web-app-firewall';

export class AppsyncApiBehindWafStack extends Stack {

    private backendAPI = new AppsyncAPI(this, 'AppsyncAPI');

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Adding AWS WAF protection to your AppSync API
        new WebAppFirewall(this, "WAF", {
            apiArn: this.backendAPI.api.attrArn
        });

    }
}
