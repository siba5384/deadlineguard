import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNudges, dismissNudge } from '../api/client'
import { useAppStore } from '../store/appStore'
import { useEffect } from 'react'

export function useNudges() {
  const userId = useAppStore(s => s.userId)
  const setNudgeQueue = useAppStore(s => s.setNudgeQueue)

  const query = useQuery({
    queryKey: ['nudges', userId],
    queryFn: () => fetchNudges(userId),
    refetchInterval: 20_000, // poll every 20s
  })

  useEffect(() => {
    if (query.data) setNudgeQueue(query.data)
  }, [query.data, setNudgeQueue])

  return query
}

export function useDismissNudge() {
  const qc = useQueryClient()
  const userId = useAppStore(s => s.userId)
  const removeNudge = useAppStore(s => s.removeNudge)
  return useMutation({
    mutationFn: dismissNudge,
    onSuccess: (_, id) => {
      removeNudge(id)
      qc.invalidateQueries({ queryKey: ['nudges', userId] })
    },
  })
}
