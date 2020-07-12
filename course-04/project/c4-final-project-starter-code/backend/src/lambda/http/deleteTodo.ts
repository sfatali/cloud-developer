import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log('Updating todo item with ID: ', todoId)

  const todoItemDbRecord = await getTodoById(todoId)
  console.log("Todo item fetch result: ", todoItemDbRecord)
  if (todoItemDbRecord.Count == 0) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }

  const todoItem = todoItemDbRecord.Items[0]
  /*if(todoItemDbRecord.Items[0].userId !== "1") {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }*/

  await deleteTodo(todoItem.userId, todoItem.createdAt)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}

async function getTodoById(todoId: string) {

  const result = await docClient.query({
    TableName : todosTable,
    IndexName : todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  return result
}

async function deleteTodo(userId: string, createdAt: string) {
  await docClient.delete({
    TableName: todosTable,
    Key: {
      userId,
      createdAt
    }
  }).promise()
}
