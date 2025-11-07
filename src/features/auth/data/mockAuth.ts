import type { User, AuthResponse } from '../types'

// Mock credentials
export const MOCK_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
  // Admin account
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
}

// Mock user data
export const MOCK_USER: User = {
  _id: 'mock_user_001',
  id: 'mock_user_001',
  name: 'Demo User',
  nickname: 'Demo',
  email: 'demo@example.com',
  lang: 'vi',
  profileImg: undefined,
  phone: '+84123456789',
  role: 'user',
  isSubscribed: true,
  subscription: {
    planId: 'free',
    planName: 'Free Plan',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
}

export const MOCK_ADMIN_USER: User = {
  ...MOCK_USER,
  _id: 'mock_admin_001',
  id: 'mock_admin_001',
  name: 'Admin User',
  nickname: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
}

// Helper to get or create mock user
const getMockUser = (email: string, name?: string): User => {
  // Check if user exists in localStorage (from signup)
  const storedUsers = localStorage.getItem('mock_users')
  if (storedUsers) {
    try {
      const users: Record<string, User> = JSON.parse(storedUsers)
      if (users[email]) {
        return users[email]
      }
    } catch (e) {
      console.error('Error parsing mock users:', e)
    }
  }

  // Check for known credentials
  if (email === MOCK_CREDENTIALS.email) {
    return MOCK_USER
  }
  if (email === MOCK_CREDENTIALS.adminEmail) {
    return MOCK_ADMIN_USER
  }

  // Create new user for signup
  const newUser: User = {
    _id: `mock_user_${Date.now()}`,
    id: `mock_user_${Date.now()}`,
    name: name || email.split('@')[0],
    nickname: name?.split(' ')[0] || email.split('@')[0],
    email: email,
    lang: 'vi',
    profileImg: undefined,
    phone: undefined,
    role: 'user',
    isSubscribed: true,
    subscription: {
      planId: 'free',
      planName: 'Free Plan',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    },
  }

  // Store new user
  const users: Record<string, User> = storedUsers ? JSON.parse(storedUsers) : {}
  users[email] = newUser
  localStorage.setItem('mock_users', JSON.stringify(users))

  return newUser
}

// Mock authentication function
export const mockLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check known credentials first
  if (
    (email === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password) ||
    (email === MOCK_CREDENTIALS.adminEmail &&
      password === MOCK_CREDENTIALS.adminPassword)
  ) {
    const isAdmin = email === MOCK_CREDENTIALS.adminEmail
    return {
      user: isAdmin ? MOCK_ADMIN_USER : MOCK_USER,
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    }
  }

  // Check if user exists in localStorage (from signup)
  const storedUsers = localStorage.getItem('mock_users')
  if (storedUsers) {
    try {
      const users: Record<string, any> = JSON.parse(storedUsers)
      const user = users[email]
      if (user && user.password === password) {
        // Remove password from user object before returning
        const { password: _, ...userWithoutPassword } = user
        return {
          user: userWithoutPassword as User,
          accessToken: `mock_access_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
        }
      }
    } catch (e) {
      console.error('Error parsing mock users:', e)
    }
  }

  throw new Error('Invalid email or password')

}

export const mockGetMe = async (): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  // Check if token exists in localStorage
  const token = localStorage.getItem('access_token')
  if (!token || !token.startsWith('mock_access_token')) {
    throw new Error('Not authenticated')
  }

  // Return user based on token or default to regular user
  const email = localStorage.getItem('mock_user_email') || MOCK_CREDENTIALS.email
  return getMockUser(email)
}

