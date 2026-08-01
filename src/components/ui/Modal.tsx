import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { useId, isValidElement, ReactNode, ReactElement } from "react";
import React from "react";
import useKeyPress from "../../utils/useKeyPress";
import { useEffect } from "react";
import { useLanguage } from "../../utils/useLanguage";

/**
 * Modal de dialogue réutilisable avec animation, autofocus et raccourcis clavier.
 *
 * @typedef {Object} ModalButtonConfig
 * @property {string} [label] - Libellé du bouton.
 * @property {string} [variant] - Variante visuelle du bouton.
 * @property {string} [className] - Classes CSS supplémentaires appliquées au bouton.
 * @property {Function} [onClick] - Gestionnaire d'événement de clic.
 * @property {string} [loading] - Activer/Désactiver le loader
 *
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Indique si la modale est ouverte.
 * @property {Function} onClose - Fonction appelée pour fermer la modale.
 * @property {string} [title] - Titre affiché dans l’en-tête de la modale.
 * @property {React.ReactNode} children - Contenu affiché dans la modale.
 * @property {boolean} [buttons=true] - Affiche ou masque les boutons de confirmation/fermeture.
 * @property {string} [className] - Classes CSS supplémentaires appliquées au contenu.
 * @property {{ close?: ModalButtonConfig, confirm?: ModalButtonConfig }} [btn] - Configuration personnalisée des boutons.
 * @property {boolean} [autoClose=true] - Ferme automatiquement la modale après confirmation.
 * @property {Function} [SubmitFn] - Fonction appelée lors du clic sur le bouton de confirmation.
 * @property {Function} [onRefuse] - Fonction appelée lors du clic sur le bouton de fermeture.
 *
 * @param {ModalProps} props
 * @returns {React.ReactElement}
 */

export interface ModalButtonConfig {
  label?: string;
  variant?: "primary" | "secondary" | "tertiary" | "lum" | string;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  props?: any;
  [key: string]: any;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  buttons?: boolean;
  className?: string;
  btn?: { close?: ModalButtonConfig; confirm?: ModalButtonConfig };
  autoClose?: boolean;
  SubmitFn?: () => void;
  onRefuse?: () => void;
}

export default function Modal(props: ModalProps) {
  const {
    isOpen,
    onClose,
    title,
    children,
    buttons = true,
    className,
    btn,
    autoClose = true,
    SubmitFn = () => {},
    onRefuse = () => {},
  } = props;
  const { t } = useLanguage();
  
  useEffect(() => {
    if (isOpen) {
      let inputs = document.querySelectorAll("input, textarea, select");
      if (inputs.length > 0) {
        (inputs[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const handleConfrimBtn = () => {
    if (autoClose) onClose();
    SubmitFn();
  };
  const formId = useId();
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: -50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: -50,
      transition: {
        duration: 0.2,
      },
    },
  };

  useKeyPress("Enter", () => {
    if (isOpen) handleConfrimBtn?.();
  });

  useKeyPress("Escape", () => {
    if (isOpen) onClose();
  });

  const hasId = isValidElement(children) && (children.props as any)?.id;

  const getButtonProps = (button?: ModalButtonConfig) => {
    if (!button) return {};
    const { label, props = {}, ...rest } = button;
    return { ...props, ...rest };
  };

  const content = hasId
    ? children
    : isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<any>, { id: formId })
      : children;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseDown={(e: React.MouseEvent) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="backdropFilter fixed inset-0 z-50 flex items-center justify-center bg-back/60"
          >
            <motion.div
              variants={modalVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="sm:w-11/12 sm:min-w-125 max-w-2xl sm:h-auto h-full w-full sm:justify-start justify-between flex flex-col sm:rounded-2xl bg-contaner p-4 sm:p-4"
            >
              <div>
                {title && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 flex items-center justify-between gap-10"
                  >
                    <h2 className="text-3xl font-bold text-secondary">
                      {title}
                    </h2>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="sm:flex hidden h-7 cursor-pointer w-7 items-center justify-center border-none bg-none text-2xl text-secondary transition-colors duration-300 hover:text-main"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`flex flex-col gap-2 px-2 sm:px-20 leading-relaxed text-text ${className || ""}`}
                >
                  {content}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-end gap-3"
              >
                {buttons && (
                  <div className="flex gap-3 flex-row sm:w-auto w-full">
                    <Button
                      onClick={() => {
                        onRefuse();
                        onClose();
                      }}
                      className="flex-1 sm:flex-none"
                      variant="secondary"
                      {...getButtonProps(btn?.close)}
                    >
                      {btn?.close?.label || t("close")}
                    </Button>
                    <Button
                      onClick={handleConfrimBtn}
                      form={((children as ReactElement<any>)?.props as any)?.id || formId}
                      className="flex-1 sm:flex"
                      variant="primary"
                      {...getButtonProps(btn?.confirm)}
                    >
                      {btn?.confirm?.label || t("confirm")}
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
