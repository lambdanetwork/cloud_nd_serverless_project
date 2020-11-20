import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { TodoBusinessLayer } from '../../businessLayer/todoBusinesLayer'

const logger = createLogger('generate signed url ')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing todoId' })
      }
    }

    const url = TodoBusinessLayer.generateUploadUrl(event, logger)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (err) {
    logger.error('failed to get signed url', err)
  }
}
