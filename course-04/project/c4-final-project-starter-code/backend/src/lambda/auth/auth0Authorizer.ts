import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-clzf4peo.eu.auth0.com/.well-known/jwks.json'

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
  const token = getToken(authHeader)
  const decodedToken: Jwt = decode(token, { complete: true }) as Jwt
  console.log("JWT is: ", decodedToken)

  const jwks = await getJWKS()  
  console.log("JSON Web Key Set: ", jwks)

  const { header } = decodedToken;
  if ( !header || header.alg !== 'RS256' ) {
    throw new Error( 'Token is not RS256 encoded' );
  }

  const key = getJWKSSigningKey(header.kid, jwks);
  const actualKey = key.publicKey || key.rsaPublicKey;
  
  return verify(token, actualKey, { algorithms: ['RS256'] }) as JwtPayload
}

async function getJWKS() {
  const jwks = await axios({
    method: 'get',
    url: jwksUrl
  });
  const keys = jwks.data.keys

  if (!keys || !keys.length) {
    return new Error('The JWKS endpoint did not contain any keys');
  }

  return keys;
}

function getJWKSSigningKeys(jwks) {
  return jwks
    .filter(
      ( key ) =>
        key.use === 'sig' && // JWK property `use` determines the JWK is for signing
        key.kty === 'RSA' && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present to be useful for later
        ( ( key.x5c && key.x5c.length ) || ( key.n && key.e ) ) // Has useful public keys
    )
    .map( ( key ) => ( { kid: key.kid, nbf: key.nbf, publicKey: certToPEM( key.x5c[ 0 ] ) } ) );
}

function getJWKSSigningKey(kid, jwks) {
  return getJWKSSigningKeys(jwks).find( ( key ) => key.kid === kid );
}

function certToPEM(cert) {
  let pem = cert.match( /.{1,64}/g ).join( '\n' );
  pem = `-----BEGIN CERTIFICATE-----\n${ cert }\n-----END CERTIFICATE-----\n`;
  return pem;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
