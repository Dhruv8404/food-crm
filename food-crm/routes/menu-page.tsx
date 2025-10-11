"use client"

import { useApp } from "@/context/app-context"
import { motion } from "framer-motion"

export default function MenuPage() {
  const { addToCart, state } = useApp()

  return (
    <section>
      <h1 className="text-pretty text-2xl font-semibold">Menu</h1>
      <p className="mb-4 text-sm text-muted-foreground">Pick your favorites.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.menu.map((m, i) => (
          <motion.div key={m.id} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card shadow">
            <img src={m.image || "/placeholder.svg"} alt={m.name} className="h-40 w-full rounded-t-xl object-cover" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{m.name}</h3>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  ${m.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <button
                onClick={() => addToCart(m.id)}
                className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
