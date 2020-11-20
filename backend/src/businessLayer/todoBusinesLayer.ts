import 'source-map-support/register'

import { APIGatewayProxyEvent } from 'aws-lambda'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { v4 as uuidv4 } from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoDataLayer } from '../dataLayer/todoData'
import { getUserId } from '../lambda/utils'
import { Logger } from 'winston'

const bucketName = process.env.TODO_IMAGES_S3_BUCKET

export class TodoBusinessLayer {
  static async getTodo(
    event: APIGatewayProxyEvent,
    logger: Logger
  ): Promise<{ Items: TodoItem[] }> {
    const userId = getUserId(event)
    logger.info(`get item with userId ${userId}`)

    const items = await TodoDataLayer.getTodoByUserId(userId)
    return { Items: items }
  }

  static async createTodo(
    event: APIGatewayProxyEvent,
    logger: Logger
  ): Promise<TodoItem> {
    const itemId = uuidv4()
    const userId = getUserId(event)
    const newTodo: CreateTodoRequest =
      typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const createdTodo = await TodoDataLayer.createTodo({
      userId: userId,
      todoId: itemId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
      ...newTodo
    })
    logger.info(`Creating item with params ${createdTodo}`)

    return createdTodo as TodoItem
  }

  static async updateTodo(
    event: APIGatewayProxyEvent,
    logger: Logger
  ): Promise<TodoItem> {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)

    updatedTodo.userId = userId
    updatedTodo.todoId = todoId
    logger.info(`Updating item with params ${updatedTodo}`)
    return await TodoDataLayer.updateTodo(updatedTodo)
  }

  static async deleteTodo(
    event: APIGatewayProxyEvent,
    logger: Logger
  ): Promise<boolean> {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    logger.info(`Deleting item with user:${userId} and TodoId: ${todoId}`)

    return await TodoDataLayer.deleteTodo(todoId, userId)
  }

  static async generateUploadUrl(event: APIGatewayProxyEvent, logger: Logger) {
    const todoId = event.pathParameters.todoId
    logger.info(`trying to get upload url`)

    return await TodoDataLayer.generateUploadUrl(todoId)
  }
}
