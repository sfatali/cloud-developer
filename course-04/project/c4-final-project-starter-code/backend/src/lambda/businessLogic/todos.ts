import * as uuid from 'uuid'

import { TodoItem } from '../../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()
const bucketName = process.env.TODOS_ATTACHMENTS_S3_BUCKET

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosByUserId(userId)
}

export async function getTodoById(todoId: string) {
    return todoAccess.getTodoById(todoId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

  const todoId = uuid.v4()
  const newItem: TodoItem = {
    ...createTodoRequest,
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }

  return await todoAccess.createTodo(newItem)
}

export async function updateTodo(userId: string, createdAt: string, updatedTodo: UpdateTodoRequest) {
    await todoAccess.updateTodo(userId, createdAt, updatedTodo)
}

export async function deleteTodo(userId: string, createdAt: string) {
    await todoAccess.deleteTodo(userId, createdAt)
}
