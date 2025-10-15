"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useApp } from "@/context/app-context"

export default function ScanPage() {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  const { setCurrentTable, state } = useApp()

  useEffect(() => {
    if (state.user.role === 'admin') {
      navigate('/admin')
    }
  }, [state.user.role, navigate])

  useEffect(() => {
    const table = params.table
    const hash = params.hash
    if (table && hash) {
      // Verify table
      fetch(`http://127.0.0.1:8000/api/tables/verify/?table=${table}&hash=${hash}`)
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
              setCurrentTable(data.table_no)
              // Navigate to auth page first
              navigate('/auth')
            } else {
              alert('Invalid QR code')
            }
        })
        .catch(err => console.error('Verification failed:', err))
    }
  }, [params, setCurrentTable, navigate])

  useEffect(() => {
    if (scannerRef.current && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )

      html5QrcodeScanner.render(
        (decodedText: string) => {
          // Parse the QR code data (assuming it contains table and hash)
          try {
            const url = new URL(decodedText)
            const table = url.searchParams.get('table')
            const hash = url.searchParams.get('hash')
            if (table && hash) {
              fetch(`http://127.0.0.1:8000/api/tables/verify/?table=${table}&hash=${hash}`)
                .then(res => res.json())
                .then(data => {
                  if (data.valid) {
                    setCurrentTable(data.table_no)
                    // Navigate to auth page first
                    navigate('/auth')
                  } else {
                    alert('Invalid QR code')
                  }
                })
                .catch(err => console.error('Verification failed:', err))
            } else {
              alert('Invalid QR code format')
            }
          } catch (error) {
            alert('Invalid QR code')
          }
        },
        (errorMessage: string) => {
          // Ignore errors during scanning
        }
      )

      setScanner(html5QrcodeScanner)
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanner, setCurrentTable, navigate])

  return (
    <section className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="text-balance text-center text-2xl font-semibold">Scan QR Code</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Scan the QR code on your table to start ordering.
        </p>

        <div id="qr-reader" ref={scannerRef} className="mt-6"></div>
      </div>
    </section>
  )
}
