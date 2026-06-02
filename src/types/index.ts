export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  due_date?: string
  is_recurring: boolean
  recurrence_days?: number[] // 0=Sun 1=Mon ... 6=Sat
  completed: boolean
  completed_at?: string
  project_id?: string
  priority: 'low' | 'medium' | 'high'
  category?: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  emoji?: string
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  notes?: string
  mood?: number // 1-5
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  week_end: string
  tasks_completed: number
  tasks_total: number
  highlights?: string
  improvements?: string
  mood_avg?: number
  generated_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  task_id?: string
  duration_minutes: number
  started_at: string
  ended_at?: string
}
