import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';

const logger = createLogger('get todo');

AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    const userId = getUserId(event)
    const params = {
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    logger.info(`get all todo item`)
    const result = await ddbDocumentClient.query(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    }
  } catch (error) {
    logger.error(`fail to get todo item`)
      console.error(error);
  }
}

