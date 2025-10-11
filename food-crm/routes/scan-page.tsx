"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useApp } from "@/context/app-context"

export default function ScanPage() {
  const [code, setCode] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setCurrentTable } = useApp()

  useEffect(() => {
    const table = searchParams.get('table')
    const hash = searchParams.get('hash')
    if (table && hash) {
      // Verify table
      fetch(`http://127.0.0.1:8000/api/tables/verify/?table=${table}&hash=${hash}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setCode(data.table_no)
            setCurrentTable(data.table_no)
            router.push('/menu')
          } else {
            alert('Invalid QR code')
          }
        })
        .catch(err => console.error('Verification failed:', err))
    }
  }, [searchParams, setCurrentTable, router])

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="text-balance text-center text-2xl font-semibold">Scan Table QR</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Simulate QR/Barcode by entering the table code.
        </p>

        <div className="mt-6 flex items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. TBL-07"
            className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={!code}
            onClick={() => {
              setCurrentTable(code)
              router.push("/menu")
            }}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Order Now
          </button>
        </div>
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
