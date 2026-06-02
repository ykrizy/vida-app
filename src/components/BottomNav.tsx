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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(0,0,0,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex max-w-md mx-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 transition-all ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
