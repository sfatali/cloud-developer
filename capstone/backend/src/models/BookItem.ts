export interface BookItem {
  userId: string
  bookId: string
  createdAt: string
  name: string
  author: string
  price: string
  sold: boolean
  attachmentUrl?: string
}
