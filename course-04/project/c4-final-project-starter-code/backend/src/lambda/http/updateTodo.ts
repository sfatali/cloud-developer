import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const todoItemDbRecord = await getTodoById(todoId)
  if (todoItemDbRecord.Count == 0) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
  console.log("Todo item fetch result: ", todoItemDbRecord.Items[0])
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

  await updateTodo(todoItem.userId, todoItem.createdAt, updatedTodo)

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

async function updateTodo(userId: string, createdAt: string, updatedTodo: UpdateTodoRequest) {
  console.log('!!! Updating todo item with these values: ', updatedTodo)
  console.log('User ID: ', userId)
  console.log('Timestamp: ', createdAt)

  const result = await docClient.update({
    TableName: todosTable,
    Key: {
      userId,
      createdAt
    },
    ExpressionAttributeNames: { "#N": "name" },
    UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
    ExpressionAttributeValues: {
      ":todoName": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  return result
}
