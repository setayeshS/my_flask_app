import React from 'react'
import { useCart } from '@/state/CartContext'

const products = [
  { id: 'p1', name: 'پیراهن قهوه‌ای', price: 250000, image: 'image/brown dress.jpg', description: 'پیراهن زنانه قهوه‌ای با فرم راحت' },
  { id: 'p2', name: 'پیراهن بافت زنانه قهوه ای', price: 350000, image: 'image/brown shirt.jpg', description: 'پیراهن بافت زنانه شیک' },
  { id: 'p3', name: 'دامن قهوه‌ای', price: 200000, image: 'image/brown skirt.jpg', description: 'دامن کوتاه قهوه‌ای' },
]

const HomePage: React.FC = () => {
  const { add } = useCart()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
          <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
            <img className="w-full h-full object-cover" src={p.image} alt={p.name} />
          </div>
          <div className="mt-3 flex-1">
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-primary font-semibold">{p.price.toLocaleString()} تومان</div>
            <button onClick={() => add({ id: p.id, name: p.name, price: p.price, image: p.image }, 1)} className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg">افزودن</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HomePage


