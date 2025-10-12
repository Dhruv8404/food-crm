"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "@/context/app-context"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function MenuPage() {
  const navigate = useNavigate()
  const { addToCart, removeFromCart, updateQty, clearCart, createOrderFromCart, state, fetchOrders } = useApp()
  const [parcelCart, setParcelCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [placingOrder, setPlacingOrder] = useState(false)
  const [customerPlacingOrder, setCustomerPlacingOrder] = useState(false)

  const addToParcelCart = (item: { id: string; name: string; price: number }) => {
    setParcelCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      } else {
        return [...prev, { ...item, qty: 1 }]
      }
    })
  }

  const removeFromParcelCart = (id: string) => {
    setParcelCart(prev => prev.filter(i => i.id !== id))
  }

  const updateParcelQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromParcelCart(id)
    } else {
      setParcelCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
    }
  }

  const placeParcelOrder = async () => {
    if (parcelCart.length === 0 || !state.token) return
    setPlacingOrder(true)
    const total = parcelCart.reduce((sum, i) => sum + i.price * i.qty, 0)
    const id = "ord_" + Math.random().toString(36).slice(2, 9)
    const order = {
      id,
      items: parcelCart,
      total,
      status: "pending",
      customer: { phone: 'Parcel Order', email: 'parcel@foodcrm.com' },
      table_no: null,
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(order),
      })
      if (response.ok) {
        setParcelCart([])
        fetchOrders()
        alert('Parcel order placed successfully!')
      } else {
        alert('Failed to place order')
      }
    } catch (error) {
      console.error(error)
      alert('Error placing order')
    }
    setPlacingOrder(false)
  }

  const placeCustomerOrder = async () => {
    setCustomerPlacingOrder(true)
    const order = await createOrderFromCart()
    if (order) {
      navigate('/customer')
    }
    setCustomerPlacingOrder(false)
  }

  if (state.user.role === 'admin') {
    return (
      <section>
        <h1 className="text-pretty text-2xl font-semibold">Place Parcel Order</h1>
        <p className="mb-4 text-sm text-muted-foreground">Select items for takeout order.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.menu.map((m, i) => (
            <motion.div key={m.id} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card shadow">
              <img src={m.image || "/placeholder.svg"} alt={m.name} className="h-40 w-full rounded-t-xl object-cover" />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{m.name}</h3>
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    ${m.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <Button
                  onClick={() => addToParcelCart(m)}
                  className="mt-3 w-full"
                >
                  Add to Parcel Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {parcelCart.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold mb-3">Parcel Cart</h2>
            <div className="space-y-2">
              {parcelCart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateParcelQty(item.id, item.qty - 1)}
                      className="rounded-md border border-border px-2 py-1 text-sm hover:bg-secondary/60"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateParcelQty(item.id, item.qty + 1)}
                      className="rounded-md border border-border px-2 py-1 text-sm hover:bg-secondary/60"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromParcelCart(item.id)}
                      className="rounded-md bg-red-500 px-2 py-1 text-sm text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="font-semibold">
                Total: ${parcelCart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
              </div>
              <Button onClick={placeParcelOrder} disabled={placingOrder}>
                {placingOrder ? 'Placing...' : 'Place Parcel Order'}
              </Button>
            </div>
          </div>
        )}
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-pretty text-2xl font-semibold">Menu</h1>
      <p className="mb-4 text-sm text-muted-foreground">Pick your favorites.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.menu.map((m, i) => (
          <motion.div key={m.id} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card shadow">
            <img src={m.image || "/placeholder.svg"} alt={m.name} className="h-40 w-full rounded-t-xl object-cover" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{m.name}</h3>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  ${m.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <button
                onClick={() => addToCart(m.id)}
                className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {state.cart.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Your Cart</h2>
          <div className="space-y-2">
            {state.cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="rounded-md border border-border px-2 py-1 text-sm hover:bg-secondary/60"
                  >
                    -
                  </button>
                  <span className="text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="rounded-md border border-border px-2 py-1 text-sm hover:bg-secondary/60"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-md bg-red-500 px-2 py-1 text-sm text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="font-semibold">
              Total: ${state.cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
            </div>
            <Button onClick={placeCustomerOrder} disabled={customerPlacingOrder}>
              {customerPlacingOrder ? 'Placing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
