import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENTS_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = uuid.v4()
  const todo = await createTodo(event, todoId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem: todo
    })
  }
}

async function createTodo(event: any, todoId: string) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newItem: TodoItem = {
    ...newTodo,
    todoId,
    userId: "1",
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: todosTable,
      Item: newItem
    })
    .promise()

  return newItem
}
