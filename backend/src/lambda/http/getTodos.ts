import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
AWS.config.update({region: 'ap-southeast-1'});

const tableName = 'cloud-nd-todo';
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
        TableName: tableName
    };
    var result = await ddbDocumentClient.scan(params).promise()
    console.log(JSON.stringify(result))

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {

      }
    }
  } catch (error) {
      console.error(error);
  }
}

