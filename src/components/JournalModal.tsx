import { useState, useEffect } from 'react'
import { X, BookOpen } from 'lucide-react'
import { useLogs } from '../hooks/useLogs'

const MOODS = [
  { emoji: '😞', label: 'Mau',      value: 1 },
  { emoji: '😐', label: 'Ok',       value: 3 },
  { emoji: '😄', label: 'Incrível', value: 5 },
]

interface Props {
  date: string // yyyy-MM-dd
  onClose: () => void
}

export function JournalModal({ date, onClose }: Props) {
  const { fetchLogs, upsertLog } = useLogs()
  const [mood, setMood] = useState<number | undefined>()
  const [winOfDay, setWinOfDay] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLogs().then((data) => {
      const log = data.find((l: { date: string }) => l.date === date)
      if (log) {
        setMood(log.mood)
        setWinOfDay(log.win_of_day || '')
        setGratitude(log.gratitude || '')
        setNotes(log.notes || '')
      }
    })
  }, [date])

  const handleSave = async () => {
    setSaving(true)
    await upsertLog({ date, mood, win_of_day: winOfDay || undefined, gratitude: gratitude || undefined, notes: notes || undefined })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const [displayDate] = date.split('T')
  const [year, month, day] = displayDate.split('-')
  const dateLabel = `${day}/${month}/${year}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f2f2f7]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <BookOpen size={20} className="text-indigo-500" />
          <div>
            <p className="text-[17px] font-bold text-gray-900">Diário</p>
            <p className="text-xs text-gray-400">{dateLabel}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>

        {/* Mood */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Como foi o teu dia?</p>
          </div>
          <div className="flex divide-x divide-gray-100">
            {MOODS.map(({ emoji, label, value }) => (
              <button
                key={value}
                onClick={() => setMood(value)}
                className={`flex-1 flex flex-col items-center py-4 gap-1 transition-all ${mood === value ? 'bg-indigo-50' : 'active:bg-gray-50'}`}
              >
                <span className={`text-3xl transition-transform ${mood === value ? 'scale-125' : ''}`}>{emoji}</span>
                <span className={`text-xs font-medium ${mood === value ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Win of the day */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏆</span>
            <p className="text-[15px] font-semibold text-gray-800">Vitória do dia</p>
          </div>
          <textarea
            value={winOfDay}
            onChange={e => setWinOfDay(e.target.value)}
            placeholder="O que conseguiste hoje, por mais pequeno que seja?"
            rows={3}
            className="w-full text-[15px] text-gray-800 placeholder-gray-300 resize-none bg-gray-50 rounded-xl px-4 py-3"
          />
        </div>

        {/* Gratitude */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🙏</span>
            <p className="text-[15px] font-semibold text-gray-800">Grato por...</p>
          </div>
          <textarea
            value={gratitude}
            onChange={e => setGratitude(e.target.value)}
            placeholder="O que te faz sentir grato hoje?"
            rows={3}
            className="w-full text-[15px] text-gray-800 placeholder-gray-300 resize-none bg-gray-50 rounded-xl px-4 py-3"
          />
        </div>

        {/* Free note */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📝</span>
            <p className="text-[15px] font-semibold text-gray-800">Nota livre</p>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Pensamentos, ideias, reflexões — escreve o que quiseres..."
            rows={5}
            className="w-full text-[15px] text-gray-800 placeholder-gray-300 resize-none bg-gray-50 rounded-xl px-4 py-3"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="bg-white border-t border-gray-100 px-4 py-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-semibold text-[15px] transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white active:scale-[0.98]'
          }`}
        >
          {saved ? '✓ Guardado!' : saving ? 'A guardar...' : 'Guardar entrada'}
        </button>
      </div>
    </div>
  )
}
