import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';
AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
const logger = createLogger('delete todo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
  try {
    let todoId: string, userId: string;
    
    logger.info('context', context);
    todoId = event.pathParameters.todoId
    userId = getUserId(event);

    const params = {
      TableName: process.env.TODOS_TABLE,
      Key:{
        todoId, userId,
      }
    };

    const result = await ddbDocumentClient.delete(params).promise();
    logger.info(result)
  
    return {
      statusCode: 200,
      body: null,
      headers:{
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    }
  } catch(err){
    logger.error(err)
  }
}
