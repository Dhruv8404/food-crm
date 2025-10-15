"use client"

import { useApp } from "@/context/app-context"

export default function ChefDashboard() {
  const { state, markPrepared, markPreparing, fetchOrders } = useApp()
  const pendingOrders = state.orders.filter((o) => o.status === "pending")
  const preparingOrders = state.orders.filter((o) => o.status === "preparing")
  const completed = state.orders.filter((o) => o.status === "completed")

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chef Dashboard</h1>
        <button
          onClick={fetchOrders}
          className="rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80"
        >
          Refresh Orders
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Pending Orders</h2>
          <div className="mt-3 space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending orders.</p>
            ) : (
              pendingOrders.map((o) => (
                <div key={o.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">#{o.id}</div>
                    <button
                      onClick={() => markPreparing(o.id)}
                      className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                    >
                      Start Preparing
                    </button>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.name} × {i.qty}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Customer: {o.customer.phone} • {o.customer.email}
                    {o.table_no && <div>Table: {o.table_no}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Preparing Orders</h2>
          <div className="mt-3 space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders being prepared.</p>
            ) : (
              preparingOrders.map((o) => (
                <div key={o.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">#{o.id}</div>
                    <button
                      onClick={() => markPrepared(o.id)}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    >
                      Mark Completed
                    </button>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.name} × {i.qty}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Customer: {o.customer.phone} • {o.customer.email}
                    {o.table_no && <div>Table: {o.table_no}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Completed Orders</h2>
          <div className="mt-3 space-y-3">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              completed.map((o) => (
                <div key={o.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">#{o.id}</div>
                    <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">Completed</span>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.name} × {i.qty}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Customer: {o.customer.phone} • {o.customer.email}
                    {o.table_no && <div>Table: {o.table_no}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
