import React, { useEffect } from 'react'
import { useAuth } from '@/state/AuthContext'
import { useCart } from '@/state/CartContext'
import { useLocation, useNavigate } from 'react-router-dom'

const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [user])

  if (!user) return null

  const placeOrder = () => {
    if (items.length === 0) {
      alert('سبد خرید شما خالی است')
      navigate('/')
      return
    }
    // Simulate order placement
    clear()
    alert('سفارش شما با موفقیت ثبت شد!')
    navigate('/')
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-bold mb-4">پرداخت</h1>
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="flex items-center justify-between text-sm">
            <span>{i.name} × {i.quantity}</span>
            <span>{(i.price * i.quantity).toLocaleString()} تومان</span>
          </div>
        ))}
      </div>
      <div className="border-t mt-4 pt-4 flex items-center justify-between">
        <span className="font-semibold">مبلغ نهایی</span>
        <span className="font-bold">{subtotal.toLocaleString()} تومان</span>
      </div>
      <button onClick={placeOrder} className="mt-6 w-full bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg">ثبت سفارش</button>
    </div>
  )
}

export default CheckoutPage


