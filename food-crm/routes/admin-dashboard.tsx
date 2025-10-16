"use client"

import { useState, useRef } from "react"
import QRCode from "react-qr-code"
import html2canvas from "html2canvas"
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

export default function AdminDashboard() {
  const { state, markPaid } = useApp()
  const [qrData, setQrData] = useState<{ table_no: string; hash: string; url: string }[]>([])
  const [generating, setGenerating] = useState(false)
  const [rangeInput, setRangeInput] = useState('1')
  const qrRefs = useRef<(HTMLDivElement | null)[]>([])
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [editTableNo, setEditTableNo] = useState('')

  const generateQR = async () => {
    if (state.user.role !== 'admin' || !state.token) {
      alert('Please log in as admin first.')
      return
    }
    setGenerating(true)
    try {
      const body: any = { range: rangeInput.trim() || '1' }
      const response = await fetch('http://127.0.0.1:8000/api/tables/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        setQrData(data)
        setRangeInput('1')
      } else if (response.status === 401 || response.status === 403) {
        alert('Session expired. Please log in again.')
        // Optionally, call logout here if available
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate QR')
      }
    } catch (error) {
      console.error(error)
      alert('Error generating QR')
    }
    setGenerating(false)
  }

  const downloadQR = async (index: number) => {
    if (qrRefs.current[index] && qrData[index]) {
      const canvas = await html2canvas(qrRefs.current[index])
      const link = document.createElement('a')
      link.download = `table-${qrData[index].table_no}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const deleteTable = async (table_no: string, index: number) => {
    if (!confirm(`Delete table ${table_no}?`)) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tables/${table_no}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
      })
      if (response.ok) {
        setQrData(prev => prev.filter((_, i) => i !== index))
      } else {
        alert('Failed to delete table')
      }
    } catch (error) {
      console.error(error)
      alert('Error deleting table')
    }
  }

  const handleEditTable = (table_no: string) => {
    setEditingTable(table_no)
    setEditTableNo(table_no)
  }

  const saveEditTable = async () => {
    if (!editingTable || !state.token) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tables/${editingTable}/edit/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ new_table_no: editTableNo }),
      })
      if (response.ok) {
        setQrData(prev => prev.map(qr => qr.table_no === editingTable ? { ...qr, table_no: editTableNo } : qr))
        setEditingTable(null)
        setEditTableNo('')
      } else {
        alert('Failed to edit table')
      }
    } catch (error) {
      console.error(error)
      alert('Error editing table')
    }
  }

  const history = state.orders.filter((o) => o.status === "paid")

  const customerSummary = Object.values(
    history.reduce<Record<string, { phone: string; email: string; total: number; count: number }>>((acc, o) => {
      const key = `${o.customer.phone}|${o.customer.email}`
      if (!acc[key]) acc[key] = { phone: o.customer.phone, email: o.customer.email, total: 0, count: 0 }
      acc[key].total += o.total
      acc[key].count += 1
      return acc
    }, {}),
  )

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Generate Table QR</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium">Table Range (e.g., T1, T1-T5, or 3 for next 3)</label>
            <input
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="T1 or T1-T5 or 3"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={generateQR}
            disabled={generating}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Table QR'}
          </button>
        </div>
        {qrData.length > 0 && (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table No</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrData.map((qr, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {editingTable === qr.table_no ? (
                        <Input
                          value={editTableNo}
                          onChange={(e) => setEditTableNo(e.target.value)}
                          placeholder="New table number"
                        />
                      ) : (
                        qr.table_no
                      )}
                    </TableCell>
                    <TableCell>{qr.hash}</TableCell>
                    <TableCell>{qr.url}</TableCell>
                    <TableCell>
                      <div ref={(el) => { qrRefs.current[index] = el }} className="flex justify-center">
                        <QRCode value={qr.url} size={64} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingTable === qr.table_no ? (
                          <>
                            <Button size="sm" onClick={saveEditTable}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingTable(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => window.open(qr.url, '_blank')}>
                              Test
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => downloadQR(index)}>
                              Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditTable(qr.table_no)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteTable(qr.table_no, index)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>



      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Customer History</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customerSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No paid bills yet.</p>
          ) : (
            customerSummary.map((c) => (
              <div key={c.phone + c.email} className="rounded-lg border border-border p-3">
                <div className="font-medium">{c.phone}</div>
                <div className="text-sm text-muted-foreground">{c.email}</div>
                <div className="mt-2 text-sm">
                  Orders: <span className="font-medium">{c.count}</span>
                </div>
                <div className="text-sm">
                  Total Billed: <span className="font-semibold">${c.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
