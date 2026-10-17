import { useEffect, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { registerNotify } from "./notify"
import { uuid } from "../../utils/uuid"

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
    const id = uuid()

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
    info: "bg-vc-container border border-vc-line-strong text-vc-text",
    success: "bg-vc-container border border-vc-success/50 text-vc-success",
    warn: "bg-vc-container border border-vc-warning/50 text-vc-warning",
    error: "bg-vc-container border border-vc-danger/50 text-vc-danger",
  }

  const icons = {
    info: <IconInfoCircle size={20} className="text-vc-secondary/70" />,
    success: <IconCheck size={20} className="text-vc-success" />,
    warn: <IconAlertTriangle size={20} className="text-vc-warning" />,
    error: <IconAlertTriangle size={20} className="text-vc-danger" />,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      className={`px-4 py-3 min-w-64 rounded-xl shadow-2xl flex items-center justify-between gap-3 font-vc-main backdrop-blur-md ${styles[type as keyof typeof styles] || styles.info}`}
    >
      <div className="flex items-center gap-3">
        {icons[type as keyof typeof icons] || icons.info}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="text-vc-text/40 hover:text-vc-text transition-colors p-1">
        <IconX size={16} />
      </button>
    </motion.div>
  )
}
