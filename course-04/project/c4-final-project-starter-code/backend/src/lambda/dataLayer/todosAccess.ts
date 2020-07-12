import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../../models/TodoItem'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIdIndex = process.env.TODO_ID_INDEX) {
  }

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos by user Id', userId)

    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating new Todo', todoItem)
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async getTodoById(todoId: string) {
    logger.info('Getting a Todo by todoID', todoId)
    const result = await this.docClient.query({
      TableName : this.todosTable,
      IndexName : this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
    }).promise()
  
    return result
  }

  async updateTodo(userId: string, createdAt: string, updatedTodo: UpdateTodoRequest) {
    logger.info('Updating todo item')
  
    const result = await this.docClient.update({
      TableName: this.todosTable,
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

  async deleteTodo(userId: string, createdAt: string) {
    logger.info('Deleting todo item')
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        createdAt
      }
    }).promise()
  }
}
