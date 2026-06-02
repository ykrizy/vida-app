import type { Task } from '../types'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function showNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      icon: '/vida-app/icon-192.png',
      badge: '/vida-app/icon-192.png',
      silent: false,
    })
  } catch (e) {
    console.warn('Notification failed:', e)
  }
}

// Active timeouts so we can cancel on re-schedule
const activeTimeouts: ReturnType<typeof setTimeout>[] = []

export function scheduleTodayNotifications(tasks: Task[]) {
  if (Notification.permission !== 'granted') return

  // Clear previously scheduled
  activeTimeouts.forEach(t => clearTimeout(t))
  activeTimeouts.length = 0

  const now = Date.now()

  // 1. Task reminders — 1 hour before due_time
  tasks.forEach(task => {
    if (!task.due_time || task.completed) return
    const [h, m] = task.due_time.split(':').map(Number)
    const due = new Date()
    due.setHours(h, m, 0, 0)
    const reminderAt = due.getTime() - 60 * 60 * 1000 // 1 hour before
    const delay = reminderAt - now
    if (delay > 0) {
      const t = setTimeout(() => showNotification(`⏰ Em 1 hora`, task.title), delay)
      activeTimeouts.push(t)
    }
  })

  // 2. Morning nudge at 08:00
  const morning = new Date()
  morning.setHours(8, 0, 0, 0)
  const morningDelay = morning.getTime() - now
  if (morningDelay > 0) {
    const pending = tasks.filter(t => !t.completed).length
    const t = setTimeout(() => showNotification(
      '🌅 Bom dia!',
      pending > 0 ? `Tens ${pending} tarefa${pending !== 1 ? 's' : ''} para hoje` : 'Hoje é um novo dia — vamos a isso!'
    ), morningDelay)
    activeTimeouts.push(t)
  }

  // 3. Evening journal nudge at 21:00
  const evening = new Date()
  evening.setHours(21, 0, 0, 0)
  const eveningDelay = evening.getTime() - now
  if (eveningDelay > 0) {
    const t = setTimeout(() => showNotification('🌙 Hora de refletir', 'Como correu o teu dia? Escreve no diário 📓'), eveningDelay)
    activeTimeouts.push(t)
  }
}
