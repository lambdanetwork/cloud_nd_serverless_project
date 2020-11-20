import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { getUserId } from '../utils';

AWS.config.update({region: 'ap-southeast-1'});
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let todoId, userId;
    let updatedTodo: UpdateTodoRequest;
    if(event){
      userId = getUserId(event);
      todoId = event.pathParameters.todoId;
      updatedTodo = JSON.parse(event.body);
    } 

    const params: DocumentClient.UpdateItemInput = {
      TableName: process.env.TODOS_TABLE,
      Key:{
        todoId,
        userId
      },
      UpdateExpression:
        'set #name = :name, #dueDate = :duedate, #done = :done',
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':duedate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues:"UPDATED_NEW"
    };
    const item = await ddbDocumentClient.update(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify(item),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    }
  } catch(err){
    console.error(err)
  }
}