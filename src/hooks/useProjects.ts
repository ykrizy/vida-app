import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Project } from '../types'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setProjects(data) })
  }, [user])

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .insert({ ...project, user_id: user.id })
      .select()
      .single()
    if (data) setProjects(prev => [...prev, data])
  }, [user])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    await supabase.from('projects').update(updates).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  return { projects, addProject, updateProject, deleteProject }
}
