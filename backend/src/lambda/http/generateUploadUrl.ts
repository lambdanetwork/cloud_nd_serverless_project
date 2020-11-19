import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('generate signed url ');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

  
  const todoId = event.pathParameters.todoId

  if (!todoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing todoId' })
    }
  }

  logger.info(`try ting to get upload url`)
  const url = getUploadUrl(todoId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  } catch(err){
    logger.error('failed to get signed url', err)
  }
}

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.TODO_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}