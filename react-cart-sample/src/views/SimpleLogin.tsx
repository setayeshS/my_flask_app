import React, { useState } from 'react'

const SimpleLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // شبیه‌سازی ورود موفق: اگر هر دو فیلد پر باشند
    if (username.trim() && password.trim()) {
      setLoggedIn(true)
    }
  }

  return (
    <div className={loggedIn ? 'min-h-screen bg-[#006400] text-white' : 'min-h-screen bg-gray-50'}>
      <div className="container mx-auto px-4 py-6">
        {loggedIn && (
          <div className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20 w-fit">
            خوش آمدید
          </div>
        )}

        {!loggedIn && (
          <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-6">
            <h1 className="text-xl font-bold mb-4">ورود</h1>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="نام کاربری" value={username} onChange={e => setUsername(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="رمز عبور" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded">ورود</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleLogin


