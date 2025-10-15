"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "@/context/app-context"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function MenuPage() {
  const navigate = useNavigate()
  const { addToCart, removeFromCart, updateQty, clearCart, createOrderFromCart, state, fetchOrders, setPendingOrder } = useApp()
  const [parcelCart, setParcelCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [placingOrder, setPlacingOrder] = useState(false)
  const [customerPlacingOrder, setCustomerPlacingOrder] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const addToParcelCart = (item: { id: string; name: string; price: number }) => {
    setParcelCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: Math.min(i.qty + 1, 20) } : i)
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
      setParcelCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min(Math.max(1, qty), 20) } : i))
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

  const confirmCustomerOrder = async () => {
    setShowConfirmDialog(false)
    setCustomerPlacingOrder(true)
    if (state.token) {
      // User is already logged in, place order directly
      const order = await createOrderFromCart()
      if (order) {
        navigate('/order-success', { replace: true })
      }
    } else {
      // User not logged in, go to auth
      setPendingOrder({ items: state.cart, table_no: null })
      navigate('/auth')
    }
    setCustomerPlacingOrder(false)
  }

  const placeCustomerOrder = () => {
    if (state.cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    setShowConfirmDialog(true)
  }

  if (state.user.role === 'admin') {
    return (
      <section>
        <h1 className="text-pretty text-2xl font-semibold">Place Parcel Order</h1>
        <p className="mb-4 text-sm text-muted-foreground">Select items for takeout order.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.menu.map((m, i) => (
            <Card key={m.id} className="overflow-hidden">
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <img src={m.image || "/placeholder.svg"} alt={m.name} className="h-40 w-full object-cover" />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{m.name}</CardTitle>
                    <Badge variant="secondary">${m.price.toFixed(2)}</Badge>
                  </div>
                  <CardDescription className="mb-3">{m.description}</CardDescription>
                  <Button
                    onClick={() => addToParcelCart(m)}
                    className="w-full"
                  >
                    Add to Parcel Cart
                  </Button>
                </CardContent>
              </motion.div>
            </Card>
          ))}
        </div>

        {parcelCart.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Parcel Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parcelCart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateParcelQty(item.id, item.qty - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={item.qty}
                        onChange={(e) => updateParcelQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateParcelQty(item.id, item.qty + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromParcelCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold">
                  Total: ₹{parcelCart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
                </div>
                <Button onClick={placeParcelOrder} disabled={placingOrder}>
                  {placingOrder ? 'Placing...' : 'Place Parcel Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <Card key={m.id} className="overflow-hidden">
            <motion.div whileHover={{ y: -4 }} className="h-full">
              <img src={m.image || "/placeholder.svg"} alt={m.name} className="h-40 w-full object-cover" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{m.name}</CardTitle>
                  <Badge variant="secondary">₹{m.price.toFixed(2)}</Badge>
                </div>
                <CardDescription className="mb-3">{m.description}</CardDescription>
                <Button
                  onClick={() => addToCart(m.id)}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </CardContent>
            </motion.div>
          </Card>
        ))}
      </div>

      {state.cart.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-semibold">
                Total: ₹{state.cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}
              </div>
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button onClick={placeCustomerOrder} disabled={customerPlacingOrder}>
                    {customerPlacingOrder ? 'Placing...' : 'Place Order'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to place this order? You will be redirected to verification.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmCustomerOrder}>
                      Confirm Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
