"use client"

import { useEffect, useState, useMemo } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, CreditCard } from "lucide-react"
import { menuItems } from "@/data/menu"

export default function AdminOrders() {
  const { state, fetchOrders } = useApp()
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [editTableNo, setEditTableNo] = useState('')
  const [editItems, setEditItems] = useState<any[]>([])
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null)
  const [billingCustomer, setBillingCustomer] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const sortedOrders = [...state.orders].sort((a, b) => b.createdAt - a.createdAt)

  // Group orders by customer phone
  const ordersByCustomer = useMemo(() => {
    const groups: { [key: string]: typeof state.orders } = {}
    sortedOrders.forEach(order => {
      const customer = order.customer.phone
      if (!groups[customer]) {
        groups[customer] = []
      }
      groups[customer].push(order)
    })
    return groups
  }, [sortedOrders])

  const handleEditOrder = (orderId: string, currentTableNo: string, currentItems: any[]) => {
    setEditingOrder(orderId)
    setEditTableNo(currentTableNo || '')
    setEditItems([...currentItems])
  }

  const saveEditOrder = async () => {
    if (!editingOrder || !state.token) return
    try {
      const data: any = {}
      if (editTableNo !== '') data.table_no = editTableNo
      if (editItems.length > 0) data.items = editItems
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${editingOrder}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchOrders()
        setEditingOrder(null)
        setEditTableNo('')
        setEditItems([])
      } else {
        alert('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
    }
  }

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...editItems]
    if (qty <= 0) {
      newItems.splice(index, 1)
    } else {
      newItems[index].qty = qty
    }
    setEditItems(newItems)
  }

  const addNewItem = (menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId)
    if (!menuItem) return

    const existingItemIndex = editItems.findIndex(item => item.id === menuItem.id)
    if (existingItemIndex >= 0) {
      // Increase quantity if item already exists
      const newItems = [...editItems]
      newItems[existingItemIndex].qty += 1
      setEditItems(newItems)
    } else {
      // Add new item
      setEditItems([...editItems, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: 1
      }])
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
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

  const handleBillCustomer = async (customerPhone: string) => {
    setBillingCustomer(customerPhone)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/customers/bill/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ phone: customerPhone })
      })
      if (response.ok) {
        const data = await response.json()
        alert(`Customer ${customerPhone} billed successfully! Total: ₹${data.total_bill.toFixed(2)}`)
        await fetchOrders()
      } else {
        const error = await response.json()
        alert(`Failed to bill customer: ${error.error}`)
      }
    } catch (error) {
      console.error('Error billing customer:', error)
      alert('Error billing customer')
    }
    setBillingCustomer(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Billing</h1>
        <Link
          to="/admin"
          className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
        >
          Back to Admin
        </Link>
      </div>

      <div className="space-y-6">
        {Object.entries(ordersByCustomer).map(([customerPhone, orders]) => {
          const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)
          const unpaidOrders = orders.filter(order => order.status !== 'paid')
          const customerEmail = orders[0]?.customer.email || ''

          return (
            <div key={customerPhone} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Customer: {customerPhone}</h2>
                  <p className="text-sm text-gray-600">{customerEmail}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">Total: ₹{totalAmount.toFixed(2)}</span>
                  {unpaidOrders.length > 0 && (
                    <Button
                      onClick={() => handleBillCustomer(customerPhone)}
                      disabled={billingCustomer === customerPhone}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {billingCustomer === customerPhone ? 'Billing...' : 'Bill Customer'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Order #{order.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      Customer: {order.customer.phone} • {order.customer.email}
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} × {item.qty}</span>
                          <span>₹{(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Dialog open={editingOrder === order.id} onOpenChange={(open) => !open && setEditingOrder(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleEditOrder(order.id, order.table_no || '', order.items)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Order</DialogTitle>
                            <DialogDescription>
                              Edit the table number and order items.
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
                            <div>
                              <Label>Add New Item</Label>
                              <Select onValueChange={addNewItem}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a dish to add" />
                                </SelectTrigger>
                                <SelectContent>
                                  {menuItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} - ₹{item.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Order Items</Label>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {editItems.map((item, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                    <span className="flex-1">{item.name} - ₹{item.price.toFixed(2)}</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={item.qty}
                                      onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateItemQty(index, 0)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
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
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deletingOrder === order.id}
                      >
                        {deletingOrder === order.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
