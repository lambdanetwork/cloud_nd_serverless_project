import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
AWS.config.update({region: 'ap-southeast-1'});

const tableName = 'cloud-nd-todo';
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let todoId: string;
    if(event){
      todoId = event.pathParameters.todoId
    } else {
      todoId = "123"
    }


    const params = {
      TableName:tableName,
      Key:{
        todoId,
        createdAt: '2019-07-27T20:01:45.424Z'
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

