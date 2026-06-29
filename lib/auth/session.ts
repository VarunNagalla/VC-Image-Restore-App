import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!)
const EXPIRY = '24h'

export async function signAdminJwt(ip: string): Promise<string> {
  return new SignJWT({ sub: 'admin', ip })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret())
}

export async function verifyAdminJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}
