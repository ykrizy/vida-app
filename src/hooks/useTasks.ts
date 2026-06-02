import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Task } from '../types'
import { format } from 'date-fns'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return
    // Tenta com due_time; se falhar (coluna não existe ainda), guarda sem ela
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single()
    if (error && task.due_time) {
      // fallback: guardar sem due_time se a coluna ainda não existe
      const { due_time: _dt, ...taskWithoutTime } = task
      const { data: fallbackData } = await supabase
        .from('tasks')
        .insert({ ...taskWithoutTime, user_id: user.id })
        .select()
        .single()
      if (fallbackData) setTasks(prev => [fallbackData, ...prev])
    } else if (data) {
      setTasks(prev => [data, ...prev])
    }
  }, [user])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await supabase.from('tasks').update(updates).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const completed = !task.completed
    const updates: Partial<Task> = {
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
    }
    await supabase.from('tasks').update(updates).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const getTasksForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOfWeek = date.getDay()
    return tasks.filter(task => {
      if (task.is_recurring && task.recurrence_days?.includes(dayOfWeek)) return true
      if (task.due_date === dateStr) return true
      return false
    })
  }, [tasks])

  const getTodayTasks = useCallback(() => getTasksForDate(new Date()), [getTasksForDate])

  return { tasks, loading, addTask, updateTask, toggleTask, deleteTask, getTasksForDate, getTodayTasks, reload: load }
}
