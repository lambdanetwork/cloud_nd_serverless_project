import { TodoItem } from '../models/TodoItem'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

AWS.config.update({ region: 'ap-southeast-1' })
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient()

export class TodoDataLayer {
  static async getTodoByUserId(userId): Promise<TodoItem[]> {
    const params = {
      TableName: process.env.TODOS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    const result = await ddbDocumentClient.query(params).promise()
    return result.Items as TodoItem[]
  }

  static async createTodo(todo: TodoItem): Promise<TodoItem> {
    const params = {
      TableName: process.env.TODOS_TABLE,
      Item: todo
    }

    await ddbDocumentClient.put(params).promise()
    return todo
  }

  static async updateTodo(todo: TodoItem): Promise<TodoItem> {
    const { userId, todoId } = todo
    const params: DocumentClient.UpdateItemInput = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :duedate, #done = :done',
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':duedate': todo.dueDate,
        ':done': todo.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues: 'UPDATED_NEW'
    }
    const item = await ddbDocumentClient.update(params).promise()
    if (!item) throw new Error('Failed to update')
    return item.$response.data as TodoItem
  }

  static async deleteTodo(todoId: string, userId: string): Promise<boolean> {
    const params = {
      TableName: process.env.TODOS_TABLE,
      Key: {
        todoId,
        userId
      }
    }

    await ddbDocumentClient.delete(params).promise()
    return true
  }

  static async generateUploadUrl(todoId: string): Promise<string> {
    const s3 = new XAWS.S3({
      signatureVersion: 'v4',
      region: process.env.REGION
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
    const url = getUploadUrl(todoId)
    return url
  }
}
