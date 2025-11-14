import React, { useState } from 'react'
import { useAuth } from '@/state/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const { login, signup } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const navigate = useNavigate()
  const location = useLocation() as any

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = mode === 'login' ? await login(username, password) : await signup(username, password)
    if (ok) {
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-bold mb-4">{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="نام کاربری" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="رمز عبور" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded">{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="mt-3 text-sm text-primary underline">
        {mode === 'login' ? 'حساب ندارید؟ ثبت‌نام کنید' : 'حساب دارید؟ وارد شوید'}
      </button>
    </div>
  )
}

export default LoginPage


