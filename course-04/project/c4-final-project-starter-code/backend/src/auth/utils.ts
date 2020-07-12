import { decode } from 'jsonwebtoken'
import axios from 'axios'
import { JwtPayload } from './JwtPayload'

const jwksUrl = 'https://dev-clzf4peo.eu.auth0.com/.well-known/jwks.json'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
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

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export { parseUserId, getJWKS, getJWKSSigningKey, getToken}