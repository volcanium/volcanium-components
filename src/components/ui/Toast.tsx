import { useEffect, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { registerNotify } from "./notify"

export interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<any[]>([])

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

function Toast({ message, type, onClose }: ToastProps) {
  const styles = {
    info: "bg-back-2",
    success: "bg-green-500",
    warn: "bg-yellow-500",
    error: "bg-main",
  }

  useEffect(() => {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }, [type, message])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 ${styles[type as keyof typeof styles] || styles.info}`}
    >
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white text-xs">
        ✕
      </button>
    </motion.div>
  )
}
