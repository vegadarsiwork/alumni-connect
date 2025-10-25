import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-secret-for-development'
)

export type SessionPayload = {
  userId: string
  email: string
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN'
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return decrypt(token)
}

export async function setSession(payload: SessionPayload) {
  const token = await encrypt(payload)
  return token
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
