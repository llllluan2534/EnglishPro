import { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: Role
    grade?: number | null
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: Role
      grade?: number | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    grade?: number | null
  }
}
