import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { BookItem } from '../../models/BookItem'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('BooksAccess')

export class BooksAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly bookIdIndex = process.env.BOOK_ID_INDEX) {
  }

  async getBooksByUserId(userId: string): Promise<BookItem[]> {
    logger.info('Getting all books by user Id', userId)

    const result = await this.docClient.query({
        TableName: this.booksTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()

    const items = result.Items
    return items as BookItem[]
  }

  async getAllBooks(): Promise<BookItem[]> {
    logger.info('Getting all books')

    const result = await this.docClient.scan({
        TableName: this.booksTable
      }).promise()

    const items = result.Items
    return items as BookItem[]
  }

  async createBook(bookItem: BookItem): Promise<BookItem> {
    logger.info('Creating new book', bookItem)
    await this.docClient.put({
      TableName: this.booksTable,
      Item: bookItem
    }).promise()

    return bookItem
  }

  async getBookById(bookId: string) {
    logger.info('Getting a book by bookID', bookId)
    const result = await this.docClient.query({
      TableName : this.booksTable,
      IndexName : this.bookIdIndex,
      KeyConditionExpression: 'bookId = :bookId',
      ExpressionAttributeValues: {
          ':bookId': bookId
      }
    }).promise()
  
    return result
  }

  async updateBook(userId: string, createdAt: string, updatedBook: UpdateBookRequest) {
    logger.info('Updating book item')
  
    const result = await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        userId,
        createdAt
      },
      UpdateExpression: "set sold=:sold",
      ExpressionAttributeValues: {
        ":sold": updatedBook.sold
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()
  
    return result
  }

  async deleteBook(userId: string, createdAt: string) {
    logger.info('Deleting book item')
    await this.docClient.delete({
      TableName: this.booksTable,
      Key: {
        userId,
        createdAt
      }
    }).promise()
  }
}
