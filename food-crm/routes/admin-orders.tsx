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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminOrders() {
  const { state, fetchOrders } = useApp()
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [editTableNo, setEditTableNo] = useState('')
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const sortedOrders = [...state.orders].sort((a, b) => b.createdAt - a.createdAt)

  const handleEditOrder = (orderId: string, currentTableNo: string) => {
    setEditingOrder(orderId)
    setEditTableNo(currentTableNo || '')
  }

  const saveEditOrder = async () => {
    if (!editingOrder || !state.token) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${editingOrder}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ table_no: editTableNo })
      })
      if (response.ok) {
        await fetchOrders()
        setEditingOrder(null)
        setEditTableNo('')
      } else {
        alert('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
    }
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
        <h1 className="text-2xl font-bold">Order View</h1>
        <Link
          to="/admin"
          className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
        >
          Back to Admin
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {sortedOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Table No</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{o.customer.phone} • {o.customer.email}</TableCell>
                  <TableCell>{o.table_no || 'N/A'}</TableCell>
                  <TableCell>${o.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={editingOrder === o.id} onOpenChange={(open) => !open && setEditingOrder(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleEditOrder(o.id, o.table_no || '')}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Order Table</DialogTitle>
                            <DialogDescription>
                              Change the table number assigned to this order.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="tableNo">Table Number</Label>
                              <Input
                                id="tableNo"
                                value={editTableNo}
                                onChange={(e) => setEditTableNo(e.target.value)}
                                placeholder="Enter table number"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={saveEditOrder}>Save</Button>
                              <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
