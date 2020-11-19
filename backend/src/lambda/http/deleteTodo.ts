import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
AWS.config.update({region: 'ap-southeast-1'});

const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let todoId: string, userId: string;
    if(event){
      todoId = event.pathParameters.todoId
      userId = event.pathParameters.userId
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

    ddbDocumentClient.delete(params).promise();

  
    return {
      statusCode: 200,
      body: null
    }
  } catch(err){
    console.error(err)
  }
}

handler(null,null,null)