import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getTodoById, updateTodo } from '../businessLogic/todos'
import { getUserId, todoItemNotExists, todoItemNotBelongsToUser } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Update Todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info("Todo Id", todoId)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info("Update Todo Request", updatedTodo)
  const userId = getUserId(event)
  logger.info("User Id", userId)

  const todoItemDbRecord = await getTodoById(todoId)
  
  const notExists = todoItemNotExists(todoItemDbRecord)
  if(notExists) return notExists

  console.log("Todo item fetched result: ", todoItemDbRecord.Items[0])
  const todoItem = todoItemDbRecord.Items[0]

  const notBelongsToUser = todoItemNotBelongsToUser(userId, todoItem.userId)
  if(notBelongsToUser) return notBelongsToUser

  await updateTodo(userId, todoItem.createdAt, updatedTodo)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}