"use client"

import { useEffect, useMemo, useState } from "react"
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

export default function BillingPage() {
  const { state, markPaid, fetchOrders } = useApp()
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const pendingBills = useMemo(() => {
    return state.orders
      .filter((o) => o.status === "completed")
      .sort((a, b) => {
        const aTable = a.table_no || "ZZZ"
        const bTable = b.table_no || "ZZZ"
        return aTable.localeCompare(bTable)
      })
  }, [state.orders])

  const handleMarkPaid = async (orderId: string) => {
    setMarkingPaid(orderId)
    await markPaid(orderId)
    setMarkingPaid(null)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pending Bills</h2>
          <Link
            to="/admin"
            className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
          >
            Back to Admin
          </Link>
        </div>
        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Table No</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Billing Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pending bills.
                  </TableCell>
                </TableRow>
              ) : (
                pendingBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      {bill.customer?.phone || "N/A"} ({bill.customer?.email || "N/A"})
                    </TableCell>
                    <TableCell>{bill.table_no || "N/A"}</TableCell>
                    <TableCell>
                      <ul className="text-sm">
                        {Array.isArray(bill.items) ? bill.items.map((item) => (
                          <li key={item.id}>
                            {item.name} × {item.qty}
                          </li>
                        )) : "N/A"}
                      </ul>
                    </TableCell>
                    <TableCell>${bill.total?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleMarkPaid(bill.id)}
                        disabled={markingPaid === bill.id}
                        size="sm"
                      >
                        {markingPaid === bill.id ? "Marking..." : "Mark as Paid"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
