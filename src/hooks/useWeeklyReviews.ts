import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { WeeklyReview } from '../types'

export function useWeeklyReviews() {
  const { user } = useAuth()

  const saveReview = useCallback(async (review: Omit<WeeklyReview, 'id' | 'user_id'>) => {
    if (!user) return
    await supabase
      .from('weekly_reviews')
      .upsert({ ...review, user_id: user.id }, { onConflict: 'user_id,week_start' })
  }, [user])

  const getReviews = useCallback(async (): Promise<WeeklyReview[]> => {
    if (!user) return []
    const { data } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
    return data ?? []
  }, [user])

  return { saveReview, getReviews }
}
