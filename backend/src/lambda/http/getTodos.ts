import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get todo');

AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: process.env.TODOS_TABLE,
    };
    logger.info(`get all todo item`)
    const result = await ddbDocumentClient.scan(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {

      }
    }
  } catch (error) {
    logger.error(`fail to get todo item`)
      console.error(error);
  }
}

