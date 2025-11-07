import apiClient from '../../../core/api/axios'
import type { User, LoginCredentials, SignupData, AuthResponse } from '../types'
import { mockLogin, mockGetMe, MOCK_CREDENTIALS, MOCK_USER } from '../data/mockAuth'

// Check if we should use mock mode (when API_URL is not set or explicitly enabled)
const USE_MOCK_MODE =
  !import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// Mock signup function
const mockSignup = async (data: SignupData): Promise<{ email: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // Store user data for later login
  const storedUsers = localStorage.getItem('mock_users')
  const users: Record<string, any> = storedUsers ? JSON.parse(storedUsers) : {}
  
  const newUser = {
    _id: `mock_user_${Date.now()}`,
    id: `mock_user_${Date.now()}`,
    name: data.name,
    nickname: data.name.split(' ')[0],
    email: data.email,
    password: data.password, // Store password for mock login
    lang: 'vi',
    profileImg: undefined,
    phone: data.phone,
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
  
  users[data.email] = newUser
  localStorage.setItem('mock_users', JSON.stringify(users))
  
  return { email: data.email }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use mock authentication if in mock mode
    if (USE_MOCK_MODE) {
      const response = await mockLogin(credentials.email, credentials.password)
      // Store tokens and user email in localStorage for mock mode
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
      localStorage.setItem('mock_user_email', response.user.email)
      return response
    }

    // Real API call
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    // Tokens are stored in HTTP-only cookies, but we store refresh token reference if needed
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken)
      localStorage.setItem('refresh_token', response.data.refreshToken)
    }
    return response.data
  },

  async signup(data: SignupData): Promise<{ email: string }> {
    // Use mock signup if in mock mode
    if (USE_MOCK_MODE) {
      return await mockSignup(data)
    }

    // Real API call
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  async logout(): Promise<void> {
    // Use mock authentication if in mock mode
    if (USE_MOCK_MODE) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('mock_user_email')
      return
    }

    // Real API call
    await apiClient.post('/auth/logout')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  async getMe(): Promise<User> {
    // Use mock authentication if in mock mode
    if (USE_MOCK_MODE) {
      return await mockGetMe()
    }

    // Real API call
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  async refreshToken(): Promise<AuthResponse | null> {
    // Use mock authentication if in mock mode
    if (USE_MOCK_MODE) {
      try {
        const email = localStorage.getItem('mock_user_email') || MOCK_CREDENTIALS.email
        const password =
          email === MOCK_CREDENTIALS.adminEmail
            ? MOCK_CREDENTIALS.adminPassword
            : MOCK_CREDENTIALS.password
        return await mockLogin(email, password)
      } catch (error) {
        return null
      }
    }

    // Real API call
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh')
      return response.data
    } catch (error) {
      return null
    }
  },

  async googleAuth(code: string): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(`/auth/google?code=${code}`)
    return response.data
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    await apiClient.post('/auth/email-verification', { email, code })
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await apiClient.post('/auth/resend-email-verification', { email })
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot', { email })
  },

  async resetPassword(email: string, code: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email, code, password })
  },
}


