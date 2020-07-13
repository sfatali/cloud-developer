import * as uuid from 'uuid'

import { BookItem } from '../../models/BookItem'
import { BooksAccess } from '../dataLayer/booksAccess'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'

const bookAccess = new BooksAccess()
const bucketName = process.env.BOOKS_ATTACHMENTS_S3_BUCKET

export async function getBooksByUserId(userId: string): Promise<BookItem[]> {
  return bookAccess.getBooksByUserId(userId)
}

export async function getAllBooks() : Promise<BookItem[]> {
  return bookAccess.getAllBooks()
}

export async function getBookById(bookId: string) {
    return bookAccess.getBookById(bookId)
}

export async function createBook(
  createBookRequest: CreateBookRequest, userId: string): Promise<BookItem> {

  const bookId = uuid.v4()
  const newItem: BookItem = {
    ...createBookRequest,
    bookId,
    userId,
    createdAt: new Date().toISOString(),
    sold: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${bookId}`
  }

  return await bookAccess.createBook(newItem)
}

export async function updateBook(userId: string, createdAt: string, updatedBook: UpdateBookRequest) {
    await bookAccess.updateBook(userId, createdAt, updatedBook)
}

export async function deleteBook(userId: string, createdAt: string) {
    await bookAccess.deleteBook(userId, createdAt)
}
