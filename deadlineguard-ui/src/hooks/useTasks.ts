import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, updateTask, deleteTask, completeSubtask, uncompleteSubtask } from '../api/client'
import { useAppStore } from '../store/appStore'

export function useTasks() {
  const userId = useAppStore(s => s.userId)
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => fetchTasks(userId),
    refetchInterval: 30_000, // refresh every 30s
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  const userId = useAppStore(s => s.userId)
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', userId] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  const userId = useAppStore(s => s.userId)
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', userId] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const userId = useAppStore(s => s.userId)
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', userId] }),
  })
}

export function useCompleteSubtask() {
  const qc = useQueryClient()
  const userId = useAppStore(s => s.userId)
  return useMutation({
    mutationFn: ({ id, complete }: { id: number; complete: boolean }) =>
      complete ? completeSubtask(id) : uncompleteSubtask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', userId] }),
  })
}
