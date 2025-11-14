import React from 'react'
import { useCart } from '@/state/CartContext'
import { Link, useNavigate } from 'react-router-dom'

const CartPage: React.FC = () => {
  const { items, updateQty, remove, subtotal } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-2">🛒</div>
        <h1 className="text-xl font-bold mb-2">سبد خرید شما خالی است</h1>
        <Link to="/" className="text-primary underline">بازگشت به فروشگاه</Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-600">{item.price.toLocaleString()} تومان</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 bg-gray-100 rounded">-</button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 bg-gray-100 rounded">+</button>
            </div>
            <div className="w-24 text-right font-semibold">{(item.price * item.quantity).toLocaleString()} تومان</div>
            <button onClick={() => remove(item.id)} className="text-red-600 hover:underline">حذف</button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-4 h-fit">
        <h3 className="font-bold mb-4">خلاصه سفارش</h3>
        <div className="flex items-center justify-between mb-2">
          <span>جمع کل</span>
          <span className="font-semibold">{subtotal.toLocaleString()} تومان</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="w-full mt-4 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg">ادامه فرآیند خرید</button>
      </div>
    </div>
  )
}

export default CartPage


