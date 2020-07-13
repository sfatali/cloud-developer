import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getBookById, deleteBook } from '../businessLogic/books'
import { getUserId, bookItemNotExists, bookItemNotBelongsToUser } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Delete book')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId
  console.log('Book Id: ', bookId)
  const userId = getUserId(event)
  logger.info("User Id", userId)

  const bookItemDbRecord = await getBookById(bookId)
  
  const notExists = bookItemNotExists(bookItemDbRecord)
  if(notExists) return notExists

  console.log("Book item fetched result: ", bookItemDbRecord.Items[0])
  const bookItem = bookItemDbRecord.Items[0]

  const notBelongsToUser = bookItemNotBelongsToUser(userId, bookItem.userId)
  if(notBelongsToUser) return notBelongsToUser

  await deleteBook(userId, bookItem.createdAt)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}