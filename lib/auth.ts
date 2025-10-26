import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET);

export async function setSession(payload: {
  userId: string;
  email: string;
  role: string;
}) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

export async function deleteSession(token: string) {
  // In a real application, you would invalidate the token in a database or a cache.
  // For this example, we'll just acknowledge the request.
  console.log("Session token received for deletion:", token);
  return { message: "Session deletion acknowledged." };
}