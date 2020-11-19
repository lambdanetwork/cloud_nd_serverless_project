import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('generate signed url ');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let todoId: string;

  if(!event){
    todoId = 'd08f3a13-4b7d-429d-9a81-04f3115d6912'
  } else {
    todoId = event.pathParameters.todoId 
  }

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing todoId' })
    }
  }

  logger.info(`trying to get upload url`)
  const url = getUploadUrl(todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  }
  } catch(err){
    logger.error('failed to get signed url', err)
  }
}

const s3 = new XAWS.S3({
  signatureVersion: 'v4',
  region: process.env.REGION,
});

// const s3 = new AWS.S3({ 
//   signatureVersion: 'v4', 
//   region: process.env.REGION,
// })
const bucketName = process.env.TODO_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration,
  })
}


// REGION=ap-southeast-1 TODO_IMAGES_S3_BUCKET=todo-serverless-cloud-nd SIGNED_URL_EXPIRATION=300 ts-node src/lambda/http/generateUploadUrl.ts
// handler(null, null, null)