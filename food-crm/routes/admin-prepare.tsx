"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useApp } from "@/context/app-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function AdminPrepare() {
  const { state, fetchOrders, markPreparing } = useApp()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const pendingOrders = state.orders.filter(o => o.status === 'pending').sort((a, b) => (a.table_no || '').localeCompare(b.table_no || ''))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Preparation</h1>
        <Link
          to="/admin"
          className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
        >
          Back to Admin
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {pendingOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending orders to prepare.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.table_no || 'N/A'}</TableCell>
                  <TableCell>{o.customer.phone} • {o.customer.email}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {o.items.map((i) => (
                        <li key={i.id}>{i.name} × {i.qty}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>${o.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button onClick={() => markPreparing(o.id)} size="sm">
                      Mark as Preparing
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
