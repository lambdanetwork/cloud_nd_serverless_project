import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { TodoBusinessLayer } from '../../businessLayer/todoBusinesLayer'

const logger = createLogger('delete todo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    TodoBusinessLayer.deleteTodo(event, logger)

    return {
      statusCode: 200,
      body: null,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (err) {
    logger.error(err)
  }
}
