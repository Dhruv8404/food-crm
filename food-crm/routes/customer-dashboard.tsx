"use client"

import { useApp } from "@/context/app-context"

export default function CustomerDashboard() {
  const { state } = useApp()
  const myOrders = state.orders.filter(
    (o) => o.customer.phone === state.user.phone && o.customer.email === state.user.email,
  )

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-secondary text-secondary-foreground",
      preparing: "bg-secondary text-secondary-foreground",
      completed: "bg-primary text-primary-foreground",
      paid: "bg-primary text-primary-foreground",
    }
    return <span className={`rounded px-2 py-0.5 text-xs ${map[s] || "bg-secondary"}`}>{s}</span>
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">My Orders</h1>
      <p className="text-sm text-muted-foreground">
        Phone {state.user.phone} • {state.user.email}
      </p>

      <div className="mt-6 space-y-3">
        {myOrders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
            No previous orders yet.
          </div>
        ) : (
          myOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o.id}</div>
                {statusBadge(o.status)}
              </div>
              <ul className="mt-2 text-sm text-muted-foreground">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right font-semibold">Total ${o.total.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
