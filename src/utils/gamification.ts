export interface LevelInfo {
  level: number
  name: string
  icon: string
  xp: number
  minXp: number
  nextXp: number | null
  progress: number // 0-100
}

const LEVELS = [
  { level: 1, name: 'Iniciante',  icon: '🌱', minXp: 0    },
  { level: 2, name: 'Aprendiz',   icon: '🌿', minXp: 100  },
  { level: 3, name: 'Explorador', icon: '🌟', minXp: 300  },
  { level: 4, name: 'Guerreiro',  icon: '⚡', minXp: 600  },
  { level: 5, name: 'Mestre',     icon: '🔥', minXp: 1000 },
  { level: 6, name: 'Campeão',    icon: '💎', minXp: 2000 },
  { level: 7, name: 'Lenda',      icon: '👑', minXp: 4000 },
]

export function getLevelInfo(xp: number): LevelInfo {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l
    else break
  }
  const next = LEVELS[current.level] ?? null
  const progress = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100
  return { ...current, xp, nextXp: next?.minXp ?? null, progress }
}

export function computeXP(params: {
  completedTasks: number
  habitCompletions: number
  dailyLogs: number
  weeklyReviews: number
}): number {
  return (
    params.completedTasks    * 10 +
    params.habitCompletions  * 15 +
    params.dailyLogs         * 5  +
    params.weeklyReviews     * 50
  )
}
