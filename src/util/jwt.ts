import jwt,  { sign, verify } from 'jsonwebtoken';
import { NoContentError } from '../middleware/err';


export const generateToken = (user: User): string => {
    // Generate a JWT token with userId as payload
    const token = sign(user, 'your-secret-key', { expiresIn: '24h' }); // Replace 'your-secret-key' with your actual secret key
    return token;
  };
export const verifyToken = (token: string | null ): User | null => {
    try {
      if(!token) { throw new NoContentError('Token verification failed'); }
      // Verify the JWT token and extract the payload
      const decoded = verify(token, 'your-secret-key') as User; // Replace 'your-secret-key' with your actual secret key
      
      // Return the decoded payload (user object)
      return decoded;
    } catch (error) {
      // If verification fails (e.g., invalid token or signature), return null
      throw new NoContentError('Token verification failed');
    }
  };