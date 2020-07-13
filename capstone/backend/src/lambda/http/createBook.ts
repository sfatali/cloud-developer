import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import { createBook } from '../businessLogic/books'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Create books')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newBook: CreateBookRequest = JSON.parse(event.body)
  logger.info("Create Book Request", newBook)
  const userId = getUserId(event)
  logger.info("User Id", userId)

  const book = await createBook(newBook, userId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: book
    })
  }
}