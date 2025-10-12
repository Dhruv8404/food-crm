"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider } from "@/context/app-context"
import Navbar from "@/components/navbar"
import ScanPage from "@/routes/scan-page"
import MenuPage from "@/routes/menu-page"
import CartPage from "@/routes/cart-page"
import AuthPage from "@/routes/auth-page"
import CustomerDashboard from "@/routes/customer-dashboard"
import ChefDashboard from "@/routes/chef-dashboard"
import AdminDashboard from "@/routes/admin-dashboard"
import AdminOrders from "@/routes/admin-orders"
import AdminPrepare from "@/routes/admin-prepare"
import BillingPage from "@/routes/billing-page"
import LoginPage from "@/routes/login-page"
import ProtectedRoute from "@/components/protected-route"

export default function AppContent() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-dvh bg-background text-foreground">
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">
            <Routes>
              <Route path="/" element={<ScanPage />} />
              <Route path="/:hash/:table" element={<ScanPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/customer"
                element={
                  <ProtectedRoute roles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chef"
                element={
                  <ProtectedRoute roles={["chef"]}>
                    <ChefDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/billing"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/prepare"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminPrepare />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
