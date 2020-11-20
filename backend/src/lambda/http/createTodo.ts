import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';

const logger = createLogger('create todo');

AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

const defaultTodo = () => {
  return {
    dueDate: new Date(Date.now() + 24 * 60 *60 * 1000).toString(),
    name: 'new task'
  }
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let newTodo: CreateTodoRequest 
    if(event){
      newTodo = JSON.parse(event.body)
    } else {
      newTodo = defaultTodo()
    }
    
    const bucketName = process.env.TODO_IMAGES_S3_BUCKET;
    const todoId = uuidv4();
    const todoObj = {
      ...newTodo, 
      userId: getUserId(event),
      todoId,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }


    const params = {
      TableName: process.env.TODOS_TABLE,
      Item:{
         ...todoObj,
      }
    };

    logger.info(
      `Creating item with params ${params}`
    )
    
    await ddbDocumentClient.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(todoObj),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    }
  } catch(err){
    logger.error(`fail to create item`, err)
  }
}
