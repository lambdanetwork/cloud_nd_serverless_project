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
    if(event){
      logger.info('context', context);
      todoId = event.pathParameters.todoId
      userId = getUserId(event);
    } else {
      todoId = "123"
      userId = "user123"
    }


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
      body: null
    }
  } catch(err){
    logger.error(err)
  }
}
