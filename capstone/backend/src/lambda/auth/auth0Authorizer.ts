import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken, getJWKS, getJWKSSigningKey } from '../../auth/utils'

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  console.log('WTF !!!!')
  const token = getToken(authHeader)
  logger.info("Token is: ", token)
  const decodedToken: Jwt = decode(token, { complete: true }) as Jwt
  logger.info("JWT is: ", decodedToken)

  const jwks = await getJWKS()  
  logger.info("JSON Web Key Set: ", jwks)

  const { header } = decodedToken;
  if ( !header || header.alg !== 'RS256' ) {
    throw new Error( 'Token is not RS256 encoded' );
  }

  const key = getJWKSSigningKey(header.kid, jwks);
  const actualKey = key.publicKey || key.rsaPublicKey;
  logger.info('Actual key', actualKey)
  
  return verify(token, actualKey, { algorithms: ['RS256'] }) as JwtPayload
}