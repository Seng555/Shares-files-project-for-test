import { verifyToken } from "../util/jwt";

export function middleware(headers: string[], headerName: string): User | null {
    const index = headers.findIndex(header => header.toLowerCase() === headerName.toLowerCase());
    if (index !== -1 && index + 1 < headers.length) {
      return verifyToken(headers[index + 1]) ;
    }
    return null;
  }