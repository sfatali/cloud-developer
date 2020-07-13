import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.BOOKS_ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const bookId = event.pathParameters.bookId

  const uploadUrl = getUploadUrl(bookId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(bookId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: bookId,
    Expires: urlExpiration
  })
}