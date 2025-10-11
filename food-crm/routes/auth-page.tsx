"use client"

import { useApp } from "@/context/app-context"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Spinner from "@/components/spinner"

export default function AuthPage() {
  const { loginCustomer, createOrderFromCart } = useApp()
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const sendOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/customer/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email })
      })
      if (res.ok) {
        setSent(true)
      } else {
        alert("Failed to send OTP")
      }
    } catch (e) {
      alert("Error sending OTP")
    }
    setLoading(false)
  }

  const verify = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/customer/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, phone })
      })
      if (res.ok) {
        // Get token after verification
        const loginRes = await fetch('http://127.0.0.1:8000/api/auth/customer/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const loginData = await loginRes.json()
        if (loginRes.ok) {
          loginCustomer(phone, email, loginData.token)
          const order = await createOrderFromCart()
          navigate(order ? "/customer" : "/menu", { replace: true })
        } else {
          alert("Login failed after verification")
        }
      } else {
        alert("Invalid OTP")
      }
    } catch (e) {
      alert("Verification failed")
    }
    setLoading(false)
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Customer Verification</h1>
      <p className="text-sm text-muted-foreground">Enter phone and email to receive OTP.</p>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6">
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sent}
        />
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sent}
        />

        {!sent ? (
          <button
            disabled={!phone || !email || loading}
            onClick={sendOtp}
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {loading ? <Spinner label="Sending OTP..." /> : "Send OTP"}
          </button>
        ) : (
          <>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Enter OTP (123456)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              disabled={!otp || loading}
              onClick={verify}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              {loading ? <Spinner label="Verifying..." /> : "Verify & Confirm Order"}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
