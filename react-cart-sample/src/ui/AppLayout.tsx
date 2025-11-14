import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import { useCart } from '@/state/CartContext'

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-primary text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold">فروشگاه نمونه</Link>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <span>🛒 سبد خرید</span>
              {items.length > 0 && (
                <span className="absolute -top-2 -left-3 bg-white text-primary text-xs rounded-full px-2 py-0.5">{items.length}</span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">{user.username}</span>
                <button onClick={() => { logout(); if (location.pathname === '/checkout') navigate('/'); }} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">خروج</button>
              </div>
            ) : (
              <Link to="/login" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">ورود / ثبت‌نام</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6 flex-1">
        <Outlet />
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">© 2025</footer>
    </div>
  )
}

export default AppLayout


