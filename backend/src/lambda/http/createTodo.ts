import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'

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
    
    const params = {
      TableName: process.env.TODOS_TABLE,
      Item:{
         ...newTodo,
         userId: uuidv4(),
         todoId: uuidv4()
      }
    };

    logger.info(
      `Creating item with params ${params}`
    )
    const item = await ddbDocumentClient.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(item),
      headers: {
      }
    }
  } catch(err){
    logger.error(`fail to create item`, err)
  }
}
