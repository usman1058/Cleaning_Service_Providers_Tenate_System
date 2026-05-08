import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    guestBootstrap?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      guestBootstrap?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    guestBootstrap?: boolean
  }
}
