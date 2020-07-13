import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { getBookById, updateBook } from '../businessLogic/books'
import { getUserId, bookItemNotExists, bookItemNotBelongsToUser } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Update books')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId
  logger.info("Book Id", bookId)
  const updatedBook: UpdateBookRequest = JSON.parse(event.body)
  logger.info("Update Book Request", updatedBook)
  const userId = getUserId(event)
  logger.info("User Id", userId)

  const bookItemDbRecord = await getBookById(bookId)
  
  const notExists = bookItemNotExists(bookItemDbRecord)
  if(notExists) return notExists

  console.log("Book item fetched result: ", bookItemDbRecord.Items[0])
  const bookItem = bookItemDbRecord.Items[0]

  const notBelongsToUser = bookItemNotBelongsToUser(userId, bookItem.userId)
  if(notBelongsToUser) return notBelongsToUser

  await updateBook(userId, bookItem.createdAt, updatedBook)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}