import axios from 'axios'
import type { Task, Nudge, CheckInResult, Insight, DraftResult, User } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,  // sends JSESSIONID cookie with every request
})

// Tasks
export const fetchTasks = (userId = 1): Promise<Task[]> =>
  api.get('/tasks', { params: { userId } }).then(r => r.data)

export const fetchAllTasks = (userId = 1): Promise<Task[]> =>
  api.get('/tasks/all', { params: { userId } }).then(r => r.data)

export const fetchTask = (id: number): Promise<Task> =>
  api.get(`/tasks/${id}`).then(r => r.data)

export const createTask = (data: {
  userId: number; title: string; description?: string
  deadline: string; estimatedEffortMinutes?: number
  importance?: number; taskType?: string
}): Promise<Task> => api.post('/tasks', data).then(r => r.data)

export const updateTask = (id: number, data: Partial<{
  title: string; description: string; deadline: string
  status: string; importance: number; notes: string
}>): Promise<Task> => api.put(`/tasks/${id}`, data).then(r => r.data)

export const syncToCalendar = (id: number): Promise<Task> =>
  api.post(`/tasks/${id}/sync`).then(r => r.data)

export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/tasks/${id}`).then(r => r.data)

// Subtasks
export const completeSubtask = (id: number): Promise<void> =>
  api.patch(`/subtasks/${id}/complete`).then(r => r.data)

export const uncompleteSubtask = (id: number): Promise<void> =>
  api.patch(`/subtasks/${id}/uncomplete`).then(r => r.data)

// Nudges
export const fetchNudges = (userId = 1): Promise<Nudge[]> =>
  api.get('/nudges', { params: { userId } }).then(r => r.data)

export const dismissNudge = (id: number): Promise<void> =>
  api.post(`/nudges/${id}/dismiss`).then(r => r.data)

// Check-in
export const processCheckIn = (data: {
  userId: number; type: string; transcript: string
}): Promise<CheckInResult> => api.post('/checkins', data).then(r => r.data)

// Drafts
export const generateDraft = (taskId: number): Promise<DraftResult> =>
  api.post('/drafts', { taskId }).then(r => r.data)

// Insights
export const fetchInsights = (userId = 1): Promise<Insight[]> =>
  api.get('/insights', { params: { userId } }).then(r => r.data)

// User
export const fetchUser = (): Promise<User> =>
  api.get('/users/me').then(r => r.data)

export const updateUser = (data: { name?: string, energyPattern?: string, password?: string, avatarUrl?: string }): Promise<User> =>
  api.put('/users/me', data).then(r => r.data)

// Admin
export const triggerRiskEngine = (): Promise<void> =>
  api.post('/admin/trigger-risk-engine').then(r => r.data)

// Auth
export const loginWithPassword = (data: URLSearchParams): Promise<{message: string}> =>
  api.post('/auth/login', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(r => r.data)

export const registerUser = (data: { email: string, password: string }): Promise<{message: string}> =>
  api.post('/auth/register', data).then(r => r.data)
