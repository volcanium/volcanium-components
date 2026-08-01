import { motion, AnimatePresence } from "framer-motion";

export interface LoaderProps {
  hide?: boolean;
  full?: boolean;
}

export default function Loader({ hide, full = false }: LoaderProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loader"
        className={`${hide ? "opacity-0" : "opacity-100"} flex items-center justify-center bg-back/80 backdrop-blur-sm ${full ? "w-full" : "w-auto"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`${full ? "w-full" : "w-32"} ${hide ? "opacity-0" : "opacity-100"} h-0.5 bg-back-2 overflow-hidden rounded`}
        >
          <motion.div
            className="h-full w-1/2 bg-main"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
