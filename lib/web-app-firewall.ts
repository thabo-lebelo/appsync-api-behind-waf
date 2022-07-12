import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnWebACL, CfnWebACLAssociation } from "aws-cdk-lib/aws-wafv2";


interface Props {
    apiArn: string;
}

export class WebAppFirewall extends Stack {

    // Add Web ACL and rules
    private readonly webAcl = new CfnWebACL(this, "web-acl", {
        defaultAction: {
            allow: {}
        },
        scope: "REGIONAL",
        visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "webACL",
            sampledRequestsEnabled: true
        },
        rules: [
            {
                name: "AWS-AWSManagedRulesCommonRuleSet",
                priority: 1,
                overrideAction: { none: {} },
                statement: {
                    managedRuleGroupStatement: {
                        name: "AWSManagedRulesCommonRuleSet",
                        vendorName: "AWS",
                        excludedRules: [{ name: "SizeRestrictions_BODY" }]
                    }
                },
                visibilityConfig: {
                    cloudWatchMetricsEnabled: true,
                    metricName: "awsCommonRules",
                    sampledRequestsEnabled: true
                }
            },
        ]
    });

    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id);

        new CfnWebACLAssociation(this, "web-acl-association", {
            webAclArn: this.webAcl.attrArn,
            resourceArn: this.props.apiArn
        });

    }

}