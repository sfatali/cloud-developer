# Serverless Bookstore

# Functionality of the application

This application will allow creating/removing/updating/fetching book items. Each book item can optionally have an attachment image. Each user has access to book items that he/she has created, with ability to edit or delete those. Aside from that, it's possible to browse through all books in the system.

# Book items

Each book item contains the following fields:

* `bookId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of the book
* `author` (string) - author of the book
* `price` (string) - price of the book
* `sold` (boolean) - true if an item was sold, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached of the book cover

# Functions implemented

* `Auth` - this function should implement a custom authorizer for API Gateway that should be added to all other functions.

* `GetBooksByUserId` - returns all books for a current user. A user id is extracted from a JWT token that is sent by the frontend

It should return data that looks like this:

```json
{
  "items": [
    {
      "bookId": "123",
      "userId": "....",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "LOR",
      "author": "Tolkien",
      "price": "10$",
      "sold": false,
      "attachmentUrl": "http://example.com/image.png"
    }
  ]
}
```

* `GetAllBooks` - returns all books in the system.

* `CreateBook` - a shape of data send by a client application to this function can be found in the `CreateBookRequest.ts` file

It receives a new book item to be created in JSON format that looks like this:

```json
{
  "name": "Book",
  "author": "Author",
  "price": "10$",
  "attachmentUrl": "http://example.com/image.png"
}
```

It returns a new book item that looks like this:

```json
{
  "item": {
    "name": "Book",
    "author": "Author",
    "price": "10$",
    "attachmentUrl": "http://example.com/image.png",
    "bookId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
  }
}
```

* `UpdateBook` - updates a book item created by a current user. A shape of data send by a client application to this function can be found in the `UpdateBookRequest.ts` file

It receives an object that contains three fields that can be updated in a book item:

```json
{
  "sold": true
}
```

The id of an item that should be updated is passed as a URL parameter.

It returns an empty body.

* `DeleteBook` - deletes a book item created by a current user. Expects an id of a book item to remove.

It returns an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a TODO item.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

# Best practices

To complete this exercise, please follow the best practices from the 6th lesson of this course.

## Logging

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. You can use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```


# Grading the submission

Once you have finished developing your application, please set `apiId` and Auth0 parameters in the `config.ts` file in the `client` folder. A reviewer would start the React development server to run the frontend that should be configured to interact with your serverless application.

**IMPORTANT**

*Please leave your application running until a submission is reviewed. If implemented correctly it will cost almost nothing when your application is idle.*

# Suggestions

To store TODO items, you might want to use a DynamoDB table with local secondary index(es). A create a local secondary index you need to create a DynamoDB resource like this:

```yml

TodosTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: partitionKey
        AttributeType: S
      - AttributeName: sortKey
        AttributeType: S
      - AttributeName: indexKey
        AttributeType: S
    KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE
    BillingMode: PAY_PER_REQUEST
    TableName: ${self:provider.environment.TODOS_TABLE}
    LocalSecondaryIndexes:
      - IndexName: ${self:provider.environment.INDEX_NAME}
        KeySchema:
          - AttributeName: partitionKey
            KeyType: HASH
          - AttributeName: indexKey
            KeyType: RANGE
        Projection:
          ProjectionType: ALL # What attributes will be copied to an index

```

To query an index you need to use the `query()` method like:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
