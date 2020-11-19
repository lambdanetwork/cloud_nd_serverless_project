import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: process.env.TODOS_TABLE,
    };
    const result = await ddbDocumentClient.scan(params).promise()

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

