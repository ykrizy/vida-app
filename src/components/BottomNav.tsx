import { NavLink } from 'react-router-dom'
import { CheckSquare, Calendar, Folders, Timer, BarChart3 } from 'lucide-react'

const nav = [
  { to: '/', icon: CheckSquare, label: 'Hoje' },
  { to: '/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/projetos', icon: Folders, label: 'Projetos' },
  { to: '/foco', icon: Timer, label: 'Foco' },
  { to: '/semana', icon: BarChart3, label: 'Semana' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
