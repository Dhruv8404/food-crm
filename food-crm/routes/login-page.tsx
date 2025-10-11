"use client"

import { useApp } from "@/context/app-context"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function LoginPage() {
  const { loginStaff } = useApp()
  const [role, setRole] = useState<"chef" | "admin">("chef")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from || "/"

  const submit = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/staff/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: role, password })
      })
      const data = await res.json()
      if (res.ok) {
        loginStaff(role, data.token)
        navigate(from, { replace: true })
      } else {
        alert("Invalid credentials")
      }
    } catch (e) {
      alert("Login failed")
    }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Staff Login</h1>

      <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-6">
        <label className="block text-sm">
          Role
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="chef">Chef</option>
            <option value="admin">Bill Counter Admin</option>
          </select>
        </label>

        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          placeholder="Password (chef or admin)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={submit} className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Login
        </button>
      </div>
    </section>
  )
}
