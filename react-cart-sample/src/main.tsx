import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './state/AuthContext'
import { CartProvider } from './state/CartContext'
import AppLayout from './ui/AppLayout'
import HomePage from './views/HomePage'
import CartPage from './views/CartPage'
import CheckoutPage from './views/CheckoutPage'
import LoginPage from './views/LoginPage'
import SimpleLogin from './views/SimpleLogin'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'simple-login', element: <SimpleLogin /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)


