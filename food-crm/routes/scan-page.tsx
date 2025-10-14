"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useApp } from "@/context/app-context"

interface Table {
  table_no: string
  hash: string
  active: boolean
  created_at: string
}

export default function ScanPage() {
  const [code, setCode] = useState("")
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const params = useParams()
  const { setCurrentTable, state } = useApp()

  useEffect(() => {
    if (state.user.role === 'admin') {
      navigate('/admin')
    }
  }, [state.user.role, navigate])

  useEffect(() => {
    // Fetch available tables
    fetch('http://127.0.0.1:8000/api/tables/')
      .then(res => res.json())
      .then(data => {
        setTables(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch tables:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const table = params.table
    const hash = params.hash
    if (table && hash) {
      // Verify table
      fetch(`http://127.0.0.1:8000/api/tables/verify/?table=${table}&hash=${hash}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setCode(data.table_no)
            setCurrentTable(data.table_no)
            navigate('/menu')
          } else {
            alert('Invalid QR code')
          }
        })
        .catch(err => console.error('Verification failed:', err))
    }
  }, [params, setCurrentTable, navigate])

  const handleTableSelect = (tableNo: string) => {
    setCurrentTable(tableNo)
    navigate('/menu')
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="text-balance text-center text-2xl font-semibold">Select Your Table</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Choose a table to start ordering or scan a QR code manually.
        </p>

        {loading ? (
          <p className="text-center mt-4">Loading tables...</p>
        ) : tables.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((table) => (
              <motion.button
                key={table.table_no}
                onClick={() => handleTableSelect(table.table_no)}
                className="rounded-lg border border-border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">{table.table_no}</div>
                  <div className="text-xs text-muted-foreground">Tap to select</div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-center mt-4 text-muted-foreground">No tables available. Please contact staff.</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-medium">Staff access</h2>
        <p className="text-sm text-muted-foreground">
          Chefs and billing admins can{" "}
          <a className="text-primary underline" href="/login">
            sign in here
          </a>
          .
        </p>
      </motion.div>
    </section>
  )
}
