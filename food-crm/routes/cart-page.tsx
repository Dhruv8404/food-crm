"use client"

import { useApp } from "@/context/app-context"
import { Link, useNavigate } from "react-router-dom"

export default function CartPage() {
  const { state, removeFromCart, updateQty, clearCart, createOrderFromCart, setPendingOrder } = useApp()
  const navigate = useNavigate()
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      {state.cart.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/menu" className="mt-3 inline-block text-primary underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {state.cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="rounded-md border border-border px-2 py-1"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="rounded-md border border-border px-2 py-1"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-md border border-border px-3 py-1 text-sm hover:bg-secondary/60"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-semibold">${total.toFixed(2)}</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={clearCart} className="rounded-md border border-border px-3 py-2">
              Clear
            </button>
            <button
              onClick={async () => {
                if (state.user.role === "customer") {
                  setPendingOrder(true)
                  const order = await createOrderFromCart()
                  if (order) {
                    navigate("/auth", { replace: true })
                  } else {
                    setPendingOrder(false)
                  }
                } else {
                  navigate("/auth")
                }
              }}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
