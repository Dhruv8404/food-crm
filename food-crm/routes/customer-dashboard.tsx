"use client"

import { useApp } from "@/context/app-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function CustomerDashboard() {
  const { state, fetchOrders } = useApp()
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const myOrders = state.orders.filter(
    (o) => o.customer.phone === state.user.phone && o.customer.email === state.user.email,
  )

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
      setLastUpdate(Date.now())
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchOrders])

  const statusBadge = (s: string) => {
    const map: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
      pending: "secondary",
      preparing: "default",
      completed: "default",
      paid: "default",
    }
    return <Badge variant={map[s] || "secondary"}>{s}</Badge>
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            Phone {state.user.phone} • {state.user.email}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {myOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No previous orders yet.
            </CardContent>
          </Card>
        ) : (
          myOrders.map((o) => (
            <Card key={o.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{o.id}</CardTitle>
                  {statusBadge(o.status)}
                </div>
                <CardDescription>
                  Placed on {formatTime(o.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center">
                      <span className="text-sm">
                        {i.name} × {i.qty}
                      </span>
                      <span className="text-sm font-medium">${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">${o.total.toFixed(2)}</span>
                </div>
                {o.table_no && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Table: {o.table_no}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
