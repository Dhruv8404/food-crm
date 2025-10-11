"use client"

import { useState, useRef } from "react"
import QRCode from "react-qr-code"
import html2canvas from "html2canvas"
import { useApp } from "@/context/app-context"

export default function AdminDashboard() {
  const { state, markPaid } = useApp()
  const [qrData, setQrData] = useState<{ table_no: string; hash: string; url: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [tableInput, setTableInput] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  const generateQR = async () => {
    setGenerating(true)
    try {
      const body: any = {}
      if (tableInput.trim()) {
        body.table_no = tableInput.trim()
      }
      const response = await fetch('/api/tables/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        setQrData(data)
        setTableInput('')  // Clear input after success
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

  const downloadQR = async () => {
    if (qrRef.current && qrData) {
      const canvas = await html2canvas(qrRef.current)
      const link = document.createElement('a')
      link.download = `table-${qrData.table_no}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const readyToBill = state.orders.filter((o) => o.status === "completed")
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
            <label className="block text-sm font-medium">Table Number (optional, e.g., T5)</label>
            <input
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              placeholder="Leave empty for next sequential"
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
        {qrData && (
          <div className="mt-4 space-y-4">
            <div className="text-sm">
              <strong>Table No:</strong> {qrData.table_no}
            </div>
            <div className="text-sm">
              <strong>Hash:</strong> {qrData.hash}
            </div>
            <div className="text-sm">
              <strong>URL:</strong> {qrData.url}
            </div>
            <div ref={qrRef} className="flex justify-center">
              <QRCode value={qrData.url} size={256} />
            </div>
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => window.open(qrData.url, '_blank')}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground"
              >
                Test QR
              </button>
              <button
                onClick={downloadQR}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground"
              >
                Download QR
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Completed Orders (Bill & Mark Paid)</h2>
        <div className="mt-3 space-y-3">
          {readyToBill.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed orders.</p>
          ) : (
            readyToBill.map((o) => (
              <div key={o.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{o.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {o.customer.phone} • {o.customer.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">${o.total.toFixed(2)}</div>
                    <button
                      onClick={() => markPaid(o.id)}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.name} × {i.qty}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
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
