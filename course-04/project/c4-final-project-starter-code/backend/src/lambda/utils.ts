import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

function todoItemNotBelongsToUser(userId: string, dbItemUserId: string) {
  if(dbItemUserId !== userId) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'This Todo does not belong to your user.'
    }
  } else {
    return null
  }
}

function todoItemNotExists(todoItemDbRecord: any) {
  if (todoItemDbRecord.Count == 0) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'Such Todo item does not exist.'
    }
  } else {
    return null
  }
}

export { getUserId, todoItemNotBelongsToUser, todoItemNotExists };