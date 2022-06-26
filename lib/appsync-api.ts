import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import { CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver } from "aws-cdk-lib/aws-appsync";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { readFileSync } from "fs";

export class AppsyncAPI extends Stack {

    // Add AppSync GraphQL API, generate an API key for use and a schema
    readonly api = new CfnGraphQLApi(this, "graphql-api-id", {
        name: "Backend",
        authenticationType: "API_KEY",
        xrayEnabled: true
    });

    readonly schema = new CfnGraphQLSchema(this, "graphql-api-schema", {
        apiId: this.api.attrApiId,
        definition: readFileSync("./src/graphql/schema.graphql").toString(),
    });

    readonly customersTable = Table.fromTableName(this, "cusomers-table", "customers");

    readonly accessDynamoDBRole = new Role(this, "AppSync-AccessDynamoDBRole", {
        assumedBy: new ServicePrincipal("appsync.amazonaws.com")
    });

    readonly customersDataSource = new CfnDataSource(this, "customers-dataspource", {
        apiId: this.api.attrApiId,
        name: this.customersTable.tableName,
        type: "AMAZON_DYNAMODB",
        dynamoDbConfig: {
            awsRegion: "us-east-1",
            tableName: this.customersTable.tableName,
        },
        serviceRoleArn: this.accessDynamoDBRole.roleArn
    });

    readonly getCustomersResolver = new CfnResolver(this, "get-customers-resolver", {
        apiId: this.api.attrApiId,
        typeName: "Query",
        fieldName: "getCustomers",
        requestMappingTemplate: readFileSync("./src/graphql/getCustomers/request.vtl").toString(),
        responseMappingTemplate: readFileSync("./src/graphql/getCustomers/response.vtl").toString(),
        dataSourceName: this.customersDataSource.name
    });

    readonly listCustomersResolver = new CfnResolver(this, "list-customers-resolver", {
        apiId: this.api.attrApiId,
        typeName: "Query",
        fieldName: "listCustomers",
        requestMappingTemplate: readFileSync("./src/graphql/listCustomers/request.vtl").toString(),
        responseMappingTemplate: readFileSync("./src/graphql/listCustomers/response.vtl").toString(),
        dataSourceName: this.customersDataSource.name
    });

    constructor(scope: Construct, id: string) {
        super(scope, id);

        new CfnApiKey(this, "graphql-api-key", {
            apiId: this.api.attrApiId,
        });

        // Ensures that the resolvers are created after the schema.
        this.getCustomersResolver.addDependsOn(this.schema)
        this.listCustomersResolver.addDependsOn(this.schema);

        // Ensures that AppSync is able to access DynamoDB.
        this.customersTable.grantReadData(this.accessDynamoDBRole);

    }

}