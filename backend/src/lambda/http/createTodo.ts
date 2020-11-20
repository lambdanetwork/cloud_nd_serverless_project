import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { TodoBusinessLayer } from '../../businessLayer/todoBusinesLayer'
import { createLogger } from '../../utils/logger'

AWS.config.update({ region: 'ap-southeast-1' })
const logger = createLogger('create todo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const todoObj = TodoBusinessLayer.createTodo(event, logger)
    return {
      statusCode: 200,
      body: JSON.stringify(todoObj),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (err) {
    logger.error(`fail to create item`, err)
  }
}
