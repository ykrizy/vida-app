// Local storage fallback for offline/no-auth use
import type { Task, Project, DailyLog, WeeklyReview } from '../types'

const KEYS = {
  tasks: 'vida_tasks',
  projects: 'vida_projects',
  logs: 'vida_daily_logs',
  reviews: 'vida_weekly_reviews',
}

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid(): string {
  return crypto.randomUUID()
}

// Tasks
export const localTasks = {
  getAll: (): Task[] => get<Task>(KEYS.tasks),
  save: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>): Task => {
    const tasks = get<Task>(KEYS.tasks)
    const newTask: Task = {
      ...task,
      id: uid(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    }
    set(KEYS.tasks, [...tasks, newTask])
    return newTask
  },
  update: (id: string, updates: Partial<Task>): void => {
    const tasks = get<Task>(KEYS.tasks)
    set(KEYS.tasks, tasks.map(t => t.id === id ? { ...t, ...updates } : t))
  },
  delete: (id: string): void => {
    set(KEYS.tasks, get<Task>(KEYS.tasks).filter(t => t.id !== id))
  },
}

// Projects
export const localProjects = {
  getAll: (): Project[] => get<Project>(KEYS.projects),
  save: (project: Omit<Project, 'id' | 'created_at' | 'user_id'>): Project => {
    const projects = get<Project>(KEYS.projects)
    const newProject: Project = {
      ...project,
      id: uid(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    }
    set(KEYS.projects, [...projects, newProject])
    return newProject
  },
  update: (id: string, updates: Partial<Project>): void => {
    const projects = get<Project>(KEYS.projects)
    set(KEYS.projects, projects.map(p => p.id === id ? { ...p, ...updates } : p))
  },
  delete: (id: string): void => {
    set(KEYS.projects, get<Project>(KEYS.projects).filter(p => p.id !== id))
  },
}

// Daily logs
export const localLogs = {
  getAll: (): DailyLog[] => get<DailyLog>(KEYS.logs),
  getByDate: (date: string): DailyLog | undefined => {
    return get<DailyLog>(KEYS.logs).find(l => l.date === date)
  },
  upsert: (log: Omit<DailyLog, 'id' | 'created_at' | 'user_id'>): DailyLog => {
    const logs = get<DailyLog>(KEYS.logs)
    const existing = logs.find(l => l.date === log.date)
    if (existing) {
      const updated = { ...existing, ...log }
      set(KEYS.logs, logs.map(l => l.date === log.date ? updated : l))
      return updated
    }
    const newLog: DailyLog = {
      ...log,
      id: uid(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    }
    set(KEYS.logs, [...logs, newLog])
    return newLog
  },
}

// Weekly reviews
export const localReviews = {
  getAll: (): WeeklyReview[] => get<WeeklyReview>(KEYS.reviews),
  save: (review: Omit<WeeklyReview, 'id' | 'user_id'>): WeeklyReview => {
    const reviews = get<WeeklyReview>(KEYS.reviews)
    const existing = reviews.find(r => r.week_start === review.week_start)
    if (existing) {
      const updated = { ...existing, ...review }
      set(KEYS.reviews, reviews.map(r => r.week_start === review.week_start ? updated : r))
      return updated
    }
    const newReview: WeeklyReview = { ...review, id: uid(), user_id: 'local' }
    set(KEYS.reviews, [...reviews, newReview])
    return newReview
  },
}
