import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DailyLog } from '../types'

export function useLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<DailyLog[]>([])

  const fetchLogs = useCallback(async () => {
    if (!user) return []
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
    if (data) setLogs(data)
    return data ?? []
  }, [user])

  const upsertLog = useCallback(async (log: { date: string; mood?: number; notes?: string }) => {
    if (!user) return
    const { data } = await supabase
      .from('daily_logs')
      .upsert({ ...log, user_id: user.id }, { onConflict: 'user_id,date' })
      .select()
      .single()
    if (data) {
      setLogs(prev => {
        const exists = prev.find(l => l.date === log.date)
        return exists
          ? prev.map(l => l.date === log.date ? data : l)
          : [...prev, data]
      })
    }
  }, [user])

  const getLogByDate = useCallback((date: string) => {
    return logs.find(l => l.date === date)
  }, [logs])

  return { logs, fetchLogs, upsertLog, getLogByDate }
}
