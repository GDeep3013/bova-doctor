import Cookies from 'js-cookie';
import bcrypt from 'bcryptjs'; // Ensure to use bcryptjs for client-side compatibility

export async function createSession(id) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const sessionHash = await bcrypt.hash(id.toString(), 10);

  // Combine session hash with expiresAt timestamp
  const sessionData = JSON.stringify({ sessionHash, expiresAt });

  // Store session data in a cookie
  Cookies.set('session', sessionData, { expires: 7, secure: true });
}

export async function verifySession(id) {
  const sessionData = Cookies.get('session');

  if (!sessionData) return false;

  const { sessionHash, expiresAt } = JSON.parse(sessionData);
  
  // Check if the session has expired
  if (new Date() > new Date(expiresAt)) {
    deleteSession(); // Clear expired session
    return false;
  }

  // Compare provided ID with stored session hash
  return await bcrypt.compare(id.toString(), sessionHash);
}

export function getSession() {
  const sessionData = Cookies.get('session');
  if (!sessionData) return null;

  const { sessionHash, expiresAt } = JSON.parse(sessionData);
  return { sessionHash, expiresAt };
}

export function deleteSession() {
  Cookies.remove('session');
}
