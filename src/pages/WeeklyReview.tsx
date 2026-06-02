import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, subDays, addDays, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, Target, Star, Download } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { useWeeklyReviews } from '../hooks/useWeeklyReviews'
import type { WeeklyReview as WeeklyReviewType, Task } from '../types'

const MOOD_LABELS: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

// ── Heatmap ──────────────────────────────────────────
function getCompletedOnDate(tasks: Task[], dateStr: string): number {
  return tasks.filter(t => {
    if (t.completed_at) return t.completed_at.startsWith(dateStr)
    return t.completed && t.due_date === dateStr
  }).length
}

function Heatmap({ tasks }: { tasks: Task[] }) {
  const WEEKS = 18
  const today = startOfDay(new Date())
  const startDate = subDays(today, WEEKS * 7 - 1)

  const weeks: Date[][] = []
  let cursor = startDate
  while (cursor <= today) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const day = addDays(cursor, d)
      if (day <= today) week.push(day)
    }
    weeks.push(week)
    cursor = addDays(cursor, 7)
  }

  const getColor = (count: number) => {
    if (count === 0) return '#e5e7eb'
    if (count <= 1) return '#c7d2fe'
    if (count <= 3) return '#818cf8'
    if (count <= 5) return '#6366f1'
    return '#4338ca'
  }

  return (
    <div>
      {/* Month labels */}
      <div className="flex gap-1 mb-1 overflow-x-hidden">
        {weeks.map((week, wi) => {
          const first = week[0]
          const showLabel = wi === 0 || first.getDate() <= 7
          return (
            <div key={wi} className="flex-shrink-0 w-4 text-[9px] text-gray-400 text-center">
              {showLabel ? format(first, 'MMM', { locale: pt }) : ''}
            </div>
          )
        })}
      </div>
      {/* Grid: rows=day-of-week, cols=weeks */}
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
            {week.map(day => {
              const ds = format(day, 'yyyy-MM-dd')
              const count = getCompletedOnDate(tasks, ds)
              return (
                <div
                  key={ds}
                  className="w-4 h-4 rounded-sm transition-colors"
                  style={{ backgroundColor: getColor(count) }}
                  title={`${ds}: ${count} tarefas`}
                />
              )
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-gray-400">Menos</span>
        {[0, 1, 3, 5, 7].map(n => (
          <div key={n} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(n) }} />
        ))}
        <span className="text-[9px] text-gray-400">Mais</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────

export function WeeklyReview() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { tasks } = useTasks()
  const { fetchLogs, logs } = useLogs()
  const { saveReview, getReviews } = useWeeklyReviews()

  const [highlights, setHighlights] = useState('')
  const [improvements, setImprovements] = useState('')
  const [saved, setSaved] = useState(false)
  const [allReviews, setAllReviews] = useState<WeeklyReviewType[]>([])

  const weekStart = startOfWeek(subWeeks(new Date(), -weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const isCurrentWeek = weekOffset === 0

  useEffect(() => {
    getReviews().then(setAllReviews)
    fetchLogs()
  }, [getReviews, fetchLogs])

  useEffect(() => {
    const key = format(weekStart, 'yyyy-MM-dd')
    const saved = allReviews.find(r => r.week_start === key)
    setHighlights(saved?.highlights || '')
    setImprovements(saved?.improvements || '')
    setSaved(false)
  }, [weekStart, allReviews])

  const stats = useMemo(() => {
    let tasksCompleted = 0, tasksTotal = 0, moodSum = 0, moodCount = 0
    const dayStats: { date: Date; completed: number; total: number; mood?: number; note?: string }[] = []

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dow = day.getDay()
      const dayTasks = tasks.filter(t => {
        if (t.is_recurring && t.recurrence_days?.includes(dow)) return true
        if (t.due_date === dateStr) return true
        return false
      })
      const dayCompleted = dayTasks.filter(t => {
        if (!t.completed_at) return t.completed && t.due_date === dateStr
        return t.completed_at.startsWith(dateStr)
      }).length

      const log = logs.find(l => l.date === dateStr)
      if (log?.mood) { moodSum += log.mood; moodCount++ }

      tasksCompleted += dayCompleted
      tasksTotal += dayTasks.length
      dayStats.push({ date: day, completed: dayCompleted, total: dayTasks.length, mood: log?.mood, note: log?.notes })
    })

    return {
      tasksCompleted, tasksTotal,
      rate: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
      moodAvg: moodCount > 0 ? Math.round(moodSum / moodCount) : undefined,
      dayStats,
    }
  }, [days, tasks, logs])

  const handleSave = async () => {
    await saveReview({
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      tasks_completed: stats.tasksCompleted,
      tasks_total: stats.tasksTotal,
      highlights: highlights || undefined,
      improvements: improvements || undefined,
      mood_avg: stats.moodAvg,
      generated_at: new Date().toISOString(),
    })
    const key = format(weekStart, 'yyyy-MM-dd')
    setAllReviews(prev => {
      const exists = prev.find(r => r.week_start === key)
      return exists
        ? prev.map(r => r.week_start === key ? { ...r, highlights, improvements } : r)
        : [...prev, { week_start: key, highlights, improvements } as WeeklyReviewType]
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportPDF = () => window.print()

  const rateColor = stats.rate >= 80 ? 'text-green-600' : stats.rate >= 50 ? 'text-amber-500' : 'text-red-500'
  const rateBg   = stats.rate >= 80 ? 'bg-green-500'  : stats.rate >= 50 ? 'bg-amber-400'  : 'bg-red-400'

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden" id="weekly-review-print">
      <div className="bg-white px-4 pb-4 border-b border-gray-100"
        style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Avaliação Semanal</h1>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-indigo-600 text-sm font-semibold px-3 py-1.5 bg-indigo-50 rounded-xl active:bg-indigo-100 transition-colors no-print"
          >
            <Download size={14} /> PDF
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-full active:bg-gray-100">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {isCurrentWeek ? 'Esta semana' : format(weekStart, "'Semana de' d MMM", { locale: pt })}
            </p>
            <p className="text-xs text-gray-400">
              {format(weekStart, 'd MMM', { locale: pt })} – {format(weekEnd, 'd MMM yyyy', { locale: pt })}
            </p>
          </div>
          <button onClick={() => setWeekOffset(o => Math.min(o + 1, 0))} disabled={isCurrentWeek}
            className="p-2 rounded-full active:bg-gray-100 disabled:opacity-30">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <Target size={20} className="text-indigo-500 mx-auto mb-1" />
            <p className={`text-2xl font-bold ${rateColor}`}>{stats.rate}%</p>
            <p className="text-xs text-gray-400">Completo</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <TrendingUp size={20} className="text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.tasksCompleted}</p>
            <p className="text-xs text-gray-400">Feitas</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <Star size={20} className="text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.moodAvg ? MOOD_LABELS[stats.moodAvg] : '—'}</p>
            <p className="text-xs text-gray-400">Humor</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{stats.tasksCompleted} de {stats.tasksTotal} tarefas</span>
            <span className={`font-semibold ${rateColor}`}>{stats.rate}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-700 ${rateBg}`} style={{ width: `${stats.rate}%` }} />
          </div>
        </div>

        {/* Per day */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Por dia</p>
          <div className="space-y-2.5">
            {stats.dayStats.map(({ date, completed, total, mood, note }) => (
              <div key={date.toISOString()}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12 capitalize">{format(date, 'EEE', { locale: pt })}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    {total > 0 && <div className="bg-indigo-400 h-2 rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />}
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{completed}/{total}</span>
                  <span className="text-sm w-5 text-center">{mood ? MOOD_LABELS[mood] : ''}</span>
                </div>
                {note && <p className="text-xs text-gray-400 mt-1 ml-[60px] line-clamp-1 italic">"{note}"</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 mb-3">Mapa de atividade</p>
          <Heatmap tasks={tasks} />
        </div>

        {/* Reflection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Reflexão</p>
            {!isCurrentWeek && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Semana passada</span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">🌟 Destaques da semana</label>
              <textarea value={highlights} onChange={e => setHighlights(e.target.value)}
                placeholder="O que correu bem? Que conquistas tiveste?" rows={2}
                className="mt-1 w-full text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-100 rounded-xl px-3 py-2 focus:border-indigo-300 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">🎯 O que melhorar</label>
              <textarea value={improvements} onChange={e => setImprovements(e.target.value)}
                placeholder="O que podes fazer diferente na próxima semana?" rows={2}
                className="mt-1 w-full text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-100 rounded-xl px-3 py-2 focus:border-indigo-300 focus:outline-none transition-all" />
            </div>
            <button onClick={handleSave}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white active:bg-indigo-600'}`}>
              {saved ? '✓ Avaliação guardada' : 'Guardar avaliação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
