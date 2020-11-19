import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid';

AWS.config.update({region: 'ap-southeast-1'});

const tableName = 'cloud-nd-todo';
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
      TableName:tableName,
      Item:{
         ...newTodo,
         todoId: uuidv4()
      }
    };
    const item = await ddbDocumentClient.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(item),
      headers: {
      }
    }
  } catch(err){
    console.error(err)
  }
}



