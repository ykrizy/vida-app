export interface LevelInfo {
  level: number
  name: string        // tier name (e.g. "Guerreiro")
  icon: string
  xp: number          // current xp
  minXp: number       // xp floor of this level
  nextXp: number | null
  progress: number    // 0-100 within this level
}

// ── Tiers ────────────────────────────────────────────────────────────────────
// 11 tiers covering 100 levels. Within each tier the level number is appended.
const TIERS = [
  { from: 1,   to: 10,  name: 'Recruta',       icon: '🌱' },
  { from: 11,  to: 20,  name: 'Iniciado',       icon: '📗' },
  { from: 21,  to: 30,  name: 'Combatente',     icon: '⚔️' },
  { from: 31,  to: 40,  name: 'Guerreiro',      icon: '🛡️' },
  { from: 41,  to: 50,  name: 'Campeão',        icon: '🏆' },
  { from: 51,  to: 60,  name: 'Veterano',       icon: '⭐' },
  { from: 61,  to: 70,  name: 'Mestre',         icon: '🔥' },
  { from: 71,  to: 80,  name: 'Élite',          icon: '💎' },
  { from: 81,  to: 90,  name: 'Lenda',          icon: '👑' },
  { from: 91,  to: 99,  name: 'Imortal',        icon: '🌌' },
  { from: 100, to: 100, name: 'Batman',          icon: '🦇' },
]

// ── XP curve ─────────────────────────────────────────────────────────────────
// Geometric (exponential) growth: each level costs 3% more XP than the last.
//   Total XP to reach level N = round(100 × (1.03^(N-1) − 1) / 0.03)
//
// XP needed per level (incremental):
//   Lvl  1→ 2  :   100 XP
//   Lvl 10→11  :   131 XP
//   Lvl 25→26  :   209 XP
//   Lvl 50→51  :   426 XP
//   Lvl 75→76  :   908 XP
//   Lvl 99→100 : 1 812 XP   ← 18× harder than level 1
//
// Benchmarks (active user ≈ 160 XP/day):
//   Lvl 10  →  1 016 XP  (~6 days)
//   Lvl 20  →  2 512 XP  (~16 days)
//   Lvl 30  →  4 522 XP  (~1 month)
//   Lvl 50  → 10 854 XP  (~2 months)
//   Lvl 75  → 26 373 XP  (~5.5 months)
//   Lvl 100 → 58 867 XP  (~1 year)
function minXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(100 * (Math.pow(1.03, level - 1) - 1) / 0.03)
}

// Build all 100 levels
const ALL_LEVELS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1
  const tier  = TIERS.find(t => level >= t.from && level <= t.to)!
  return { level, name: tier.name, icon: tier.icon, minXp: minXpForLevel(level) }
})

// ── Public API ────────────────────────────────────────────────────────────────
export function getLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp)   // XP can never go below 0
  let current = ALL_LEVELS[0]
  for (const l of ALL_LEVELS) {
    if (safeXp >= l.minXp) current = l
    else break
  }
  const next     = ALL_LEVELS[current.level] ?? null   // index = level (0-indexed array)
  const progress = next
    ? Math.min(100, Math.round(((safeXp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100
  return { ...current, xp: safeXp, nextXp: next?.minXp ?? null, progress }
}

// ── XP sources & penalties ────────────────────────────────────────────────────
// Gains  — tuned so an active user reaches Lv100 in ≈1 year:
//   task completed       → +12 XP
//   habit completed      → +15 XP
//   daily journal        → +8  XP
//   weekly review        → +60 XP
//
// Penalties — accountability for dropped balls:
//   task overdue (past due-date, not done)   → -4 XP each
//   missed habit day (scheduled, not done)   → -3 XP each
//   day without journal (last 30 days)       → -2 XP each
//   missed weekly review                     → -10 XP each
export function computeXP(params: {
  completedTasks:       number
  habitCompletions:     number
  dailyLogs:            number
  weeklyReviews:        number
  // penalties (all optional — default 0 so old callers still work)
  overdueTasks?:        number
  missedHabitDays?:     number
  missedJournalDays?:   number
  missedWeeklyReviews?: number
}): number {
  const earned =
    params.completedTasks   * 12 +
    params.habitCompletions * 15 +
    params.dailyLogs        * 8  +
    params.weeklyReviews    * 60

  const lost =
    (params.overdueTasks        ?? 0) * 4  +
    (params.missedHabitDays     ?? 0) * 3  +
    (params.missedJournalDays   ?? 0) * 2  +
    (params.missedWeeklyReviews ?? 0) * 10

  return Math.max(0, earned - lost)
}

// Export so other components can inspect the full table if needed
export { ALL_LEVELS, TIERS, minXpForLevel }
