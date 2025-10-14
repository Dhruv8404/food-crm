"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"

export default function AdminPrepare() {
  const { state, fetchOrders, markPreparing } = useApp()

  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [editTableValue, setEditTableValue] = useState('')
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const pendingOrders = state.orders.filter(o => o.status === 'pending').sort((a, b) => (a.table_no || '').localeCompare(b.table_no || ''))

  const startEditingTable = (orderId: string, currentTable: string) => {
    setEditingTable(orderId)
    setEditTableValue(currentTable || '')
  }

  const saveTableEdit = async () => {
    if (!editingTable || !state.token) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${editingTable}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          table_no: editTableValue
        })
      })
      if (response.ok) {
        await fetchOrders()
        setEditingTable(null)
        setEditTableValue('')
      } else {
        alert('Failed to update table number')
      }
    } catch (error) {
      console.error('Error updating table:', error)
      alert('Error updating table number')
    }
  }

  const cancelTableEdit = () => {
    setEditingTable(null)
    setEditTableValue('')
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    setDeletingOrder(orderId)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      })
      if (response.ok) {
        await fetchOrders()
      } else {
        alert('Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error deleting order')
    }
    setDeletingOrder(null)
  }

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
                  <TableCell>
                    {editingTable === o.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTableValue}
                          onChange={(e) => setEditTableValue(e.target.value)}
                          className="w-20 h-8"
                          placeholder="Table"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTableEdit()
                            if (e.key === 'Escape') cancelTableEdit()
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={saveTableEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelTableEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-muted px-2 py-1 rounded"
                        onClick={() => startEditingTable(o.id, o.table_no || '')}
                      >
                        {o.table_no || 'N/A'}
                      </span>
                    )}
                  </TableCell>
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
                    <div className="flex gap-2">
                      <Button onClick={() => markPreparing(o.id)} size="sm">
                        Mark as Preparing
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOrder(o.id)}
                        disabled={deletingOrder === o.id}
                      >
                        {deletingOrder === o.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
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
