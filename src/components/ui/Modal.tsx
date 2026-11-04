import { motion, AnimatePresence } from "framer-motion";
import { Squircle } from "@squircle-js/react";
import Button from "./Button";
import Title from "./Title";
import { IconX } from "@tabler/icons-react";
import { useId, isValidElement, ReactNode, ReactElement, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const inputs = modalRef.current?.querySelectorAll("input, textarea, select");
      if (inputs && inputs.length > 0) {
        (inputs[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Prevent the page behind the modal from scrolling while it's open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Basic focus trap: keep Tab/Shift+Tab cycling within the dialog.
  const handleTrapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleConfrimBtn = () => {
    if (autoClose) onClose();
    SubmitFn();
  };
  const formId = useId();
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.97,
      y: 8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 6,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  useKeyPress("Enter", (e) => {
    // Entrée dans un champ multiligne ajoute une ligne : elle ne valide pas la modale.
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "TEXTAREA" || target.isContentEditable)) return;
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-vc-back/70 backdrop-blur-sm p-3 sm:p-6"
        >
          <Squircle cornerRadius={12} cornerSmoothing={1} asChild>
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              variants={modalVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onKeyDown={handleTrapFocus}
              className="sm:w-11/12 sm:min-w-125 max-w-2xl sm:h-auto h-full max-h-[90vh] max-sm:max-h-[calc(100dvh-1.5rem)] w-full sm:justify-start justify-between flex flex-col bg-vc-container border border-vc-line shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] p-5 sm:p-7 max-sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            >
              {/* `min-h-0` is required for a flex child to actually shrink
                  below its content's natural height and let overflow-y-auto
                  engage - without it this div just keeps growing past the
                  modal's own max-h-[90vh] cap instead of scrolling
                  internally, pushing the confirm/close buttons off-screen on
                  a tall form. */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {title && (
                  <div className="mb-4 flex items-center justify-between gap-10">
                    <Title level="lg">{title}</Title>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      aria-label={t("close")}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent text-vc-secondary/60 transition-colors duration-200 hover:border-vc-line hover:bg-vc-veil hover:text-vc-secondary"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div
                  className={`h-px bg-vc-line mb-5 transition-opacity duration-200 ${title ? "opacity-100" : "opacity-0"}`}
                />

                <div
                  className={`flex flex-col gap-2 leading-relaxed text-vc-text ${className || ""}`}
                >
                  {content}
                </div>
              </div>
              {buttons && (
                <div className="mt-6 flex justify-end gap-3">
                  <div className="flex gap-3 flex-row sm:w-auto w-full">
                    <Button
                      onClick={() => {
                        onRefuse();
                        onClose();
                      }}
                      className="flex-1 sm:flex-none max-sm:py-3"
                      variant="secondary"
                      {...getButtonProps(btn?.close)}
                    >
                      {btn?.close?.label || t("close")}
                    </Button>
                    <Button
                      onClick={handleConfrimBtn}
                      form={((children as ReactElement<any>)?.props as any)?.id || formId}
                      className="flex-1 sm:flex max-sm:py-3"
                      variant="primary"
                      {...getButtonProps(btn?.confirm)}
                    >
                      {btn?.confirm?.label || t("confirm")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </Squircle>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
