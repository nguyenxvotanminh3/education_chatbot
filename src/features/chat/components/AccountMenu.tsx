import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../core/store/hooks'
import { logout, clearAuth } from '../../auth/store/authSlice'
import { clearConversations } from '../../chat/store/conversationSlice'

interface AccountMenuProps {
  userName: string
  plan: 'Free' | 'Go'
}

const AccountMenu = ({ userName, plan }: AccountMenuProps) => {
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    
    // Clear all state immediately (optimistic update)
    dispatch(clearAuth())
    dispatch(clearConversations())
    
    // Navigate immediately
    navigate('/login', { replace: true })
    
    // Call logout API in background (fire and forget)
    dispatch(logout()).catch(() => {
      // Ignore errors - auth state already cleared
    })
    
    setIsLoggingOut(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-surface soft-elevation hover:bg-primary-500/8 focus:outline-none focus:shadow-[0_0_0_6px_rgba(124,77,255,.12)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center text-xs font-medium">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-sm text-text max-w-[120px] truncate">{userName}</div>
        <span className="ml-1 px-2 py-0.5 text-xs rounded-lg bg-primary-500/10 text-primary-600">
          {plan}
        </span>
        <svg className="w-4 h-4 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface shadow-[0_8px_24px_rgba(0,0,0,.25),inset_0_0_0_1px_var(--border)] overflow-hidden z-40">
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-primary-500/8"
          >Profile</button>
          <button
            onClick={() => { setOpen(false); navigate('/subscription') }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-primary-500/8"
          >Subscription</button>
          <div className="hairline-divider my-1" />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-3 py-2 text-left text-sm hover:bg-primary-500/8 disabled:opacity-50"
          >{isLoggingOut ? 'Logging out...' : 'Logout'}</button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu


