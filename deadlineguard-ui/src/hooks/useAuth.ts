import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface AuthStatus {
  loggedIn: boolean
  userId?: number
  githubLogin?: string
  avatarUrl?: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  energyPattern: string
}

export function useAuthStatus() {
  return useQuery<AuthStatus>({
    queryKey: ['auth-status'],
    queryFn: () =>
      axios.get('/api/auth/status', { withCredentials: true }).then(r => r.data),
    staleTime: 30_000,
    retry: false,
  })
}

export function useCurrentUser() {
  return useQuery<AuthUser>({
    queryKey: ['auth-me'],
    queryFn: () =>
      axios.get('/api/auth/me', { withCredentials: true }).then(r => r.data),
    retry: false,
  })
}

export async function logout() {
  await axios.post('/api/auth/logout', {}, { withCredentials: true })
  window.location.href = '/login'
}
