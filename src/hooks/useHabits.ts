import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Habit, HabitCompletion } from '../types'
import { format, subDays } from 'date-fns'

export function calculateStreak(habit: Habit, allCompletions: HabitCompletion[]): number {
  const completedDates = new Set(
    allCompletions.filter(c => c.habit_id === habit.id).map(c => c.completed_date)
  )
  const freq = habit.frequency_days
  let streak = 0

  // Walk backwards from yesterday (don't penalize today not being done yet)
  let check = new Date()
  check.setHours(0, 0, 0, 0)

  for (let i = 0; i < 366; i++) {
    const dateStr = format(check, 'yyyy-MM-dd')
    const dow = check.getDay()

    if (freq.includes(dow)) {
      if (completedDates.has(dateStr)) {
        streak++
      } else if (i === 0) {
        // Today not done yet — don't break
      } else {
        break // Missed a past scheduled day → streak broken
      }
    }
    check = subDays(check, 1)
  }

  return streak
}

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const since = format(subDays(new Date(), 365), 'yyyy-MM-dd')
    const [{ data: h }, { data: c }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('habit_completions').select('*').eq('user_id', user.id).gte('completed_date', since),
    ])
    if (h) setHabits(h)
    if (c) setCompletions(c)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    const { data } = await supabase.from('habits').insert({ ...habit, user_id: user.id }).select().single()
    if (data) setHabits(prev => [...prev, data])
  }, [user])

  const deleteHabit = useCallback(async (id: string) => {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
    setCompletions(prev => prev.filter(c => c.habit_id !== id))
  }, [])

  const toggleCompletion = useCallback(async (habitId: string, date: string) => {
    if (!user) return
    const existing = completions.find(c => c.habit_id === habitId && c.completed_date === date)
    if (existing) {
      await supabase.from('habit_completions').delete().eq('id', existing.id)
      setCompletions(prev => prev.filter(c => c.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, user_id: user.id, completed_date: date })
        .select()
        .single()
      if (data) setCompletions(prev => [...prev, data])
    }
  }, [user, completions])

  const isCompleted = useCallback((habitId: string, date: string): boolean => {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date)
  }, [completions])

  const getStreak = useCallback((habit: Habit): number => {
    return calculateStreak(habit, completions)
  }, [completions])

  const getTodayHabits = useCallback((): Habit[] => {
    const tod = new Date().getDay()
    return habits.filter(h => h.frequency_days.includes(tod))
  }, [habits])

  const getLast7Days = useCallback((habitId: string): { date: string; done: boolean }[] => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      result.push({ date: dateStr, done: completions.some(c => c.habit_id === habitId && c.completed_date === dateStr) })
    }
    return result
  }, [completions])

  // Count total missed habit-days across all habits in the last 30 days
  // (excludes today — you still have a chance to complete today's habits)
  const getMissedHabitsCount = useCallback((): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let missed = 0
    for (const habit of habits) {
      const created = new Date(habit.created_at)
      created.setHours(0, 0, 0, 0)
      for (let i = 1; i <= 30; i++) {
        const checkDate = subDays(today, i)
        if (checkDate < created) break // don't penalise days before habit existed
        const dow = checkDate.getDay()
        if (!habit.frequency_days.includes(dow)) continue
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        if (!completions.some(c => c.habit_id === habit.id && c.completed_date === dateStr)) {
          missed++
        }
      }
    }
    return missed
  }, [habits, completions])

  return {
    habits,
    completions,
    loading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
    getTodayHabits,
    getLast7Days,
    getMissedHabitsCount,
    reload: load,
  }
}
