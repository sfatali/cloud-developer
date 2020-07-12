import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getTodoById, deleteTodo } from '../businessLogic/todos'
import { getUserId, todoItemNotExists, todoItemNotBelongsToUser } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Delete Todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log('Todo Id: ', todoId)
  const userId = getUserId(event)
  logger.info("User Id", userId)

  const todoItemDbRecord = await getTodoById(todoId)
  
  const notExists = todoItemNotExists(todoItemDbRecord)
  if(notExists) return notExists

  console.log("Todo item fetched result: ", todoItemDbRecord.Items[0])
  const todoItem = todoItemDbRecord.Items[0]

  const notBelongsToUser = todoItemNotBelongsToUser(userId, todoItem.userId)
  if(notBelongsToUser) return notBelongsToUser

  await deleteTodo(userId, todoItem.createdAt)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}