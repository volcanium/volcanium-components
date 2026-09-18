import { useEffect, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { registerNotify } from "./notify"

export interface ToastProviderProps {
  children: ReactNode;
}

interface ToastEntry {
  id: string;
  message: string;
  type: string;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const show = useCallback((message: string, type = "info", duration = 3000) => {
    const id = crypto.randomUUID()

    setToasts(t => [...t, { id, message, type }])

    setTimeout(() => remove(id), duration || 3000)
  }, [remove])

  useEffect(() => {
    registerNotify(show)
  }, [show])

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

export interface ToastProps {
  message: string;
  type: "info" | "success" | "warn" | "error" | string;
  onClose: () => void;
  id?: string;
}

import { IconInfoCircle, IconCheck, IconAlertTriangle, IconX } from "@tabler/icons-react";

function Toast({ message, type, onClose }: ToastProps) {
  const styles = {
    info: "bg-container border border-secondary/20 text-text",
    success: "bg-container border border-green-500/50 text-green-400",
    warn: "bg-container border border-yellow-500/50 text-yellow-400",
    error: "bg-container border border-main/50 text-main",
  }

  const icons = {
    info: <IconInfoCircle size={20} className="text-secondary/70" />,
    success: <IconCheck size={20} className="text-green-500" />,
    warn: <IconAlertTriangle size={20} className="text-yellow-500" />,
    error: <IconAlertTriangle size={20} className="text-main" />,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      className={`px-4 py-3 min-w-64 rounded-xl shadow-2xl flex items-center justify-between gap-3 font-main backdrop-blur-md ${styles[type as keyof typeof styles] || styles.info}`}
    >
      <div className="flex items-center gap-3">
        {icons[type as keyof typeof icons] || icons.info}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
        <IconX size={16} />
      </button>
    </motion.div>
  )
}
