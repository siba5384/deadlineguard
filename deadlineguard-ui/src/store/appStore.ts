import { create } from 'zustand'
import type { Nudge, Task } from '../types'

interface AppState {
  userId: number
  activeTaskId: number | null
  nudgeQueue: Nudge[]
  isCreateModalOpen: boolean
  editingTask: Task | null
  selectedTab: 'active' | 'all'
  theme: 'light' | 'dark'

  setActiveTask: (id: number | null) => void
  setNudgeQueue: (nudges: Nudge[]) => void
  addNudge: (nudge: Nudge) => void
  removeNudge: (id: number) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (task: Task) => void
  closeEditModal: () => void
  setSelectedTab: (tab: 'active' | 'all') => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  userId: 1,
  activeTaskId: null,
  nudgeQueue: [],
  isCreateModalOpen: false,
  editingTask: null,
  selectedTab: 'active',
  theme: (localStorage.getItem('theme') as 'light'|'dark') || 'dark',

  setActiveTask: (id) => set({ activeTaskId: id }),
  setNudgeQueue: (nudges) => set({ nudgeQueue: nudges }),
  addNudge: (nudge) => set((s) => ({ nudgeQueue: [nudge, ...s.nudgeQueue] })),
  removeNudge: (id) => set((s) => ({ nudgeQueue: s.nudgeQueue.filter(n => n.id !== id) })),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (task) => set({ editingTask: task }),
  closeEditModal: () => set({ editingTask: null }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  toggleTheme: () => set((s) => {
    const newTheme = s.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    return { theme: newTheme }
  }),
}))
