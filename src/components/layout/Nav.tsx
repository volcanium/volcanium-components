import { ReactNode, useState, useEffect, useRef } from "react";
import { IconArrowUp, IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import Center from "./Center";
import Title from "../ui/Title";

export type NavLink = {
  label: string;
  id?: string;
  href?: string;
};

export interface NavProps {
  /** Affiche ou masque la navigation centrale (@default true) */
  displayNav?: boolean;
  /** Titre à afficher quand la navigation est masquée */
  title?: string;
  /** Nom ou logo de la marque (@default "VOLCANIUM STUDIO") */
  brandName?: ReactNode;
  /** Lien au clic sur la marque (@default "/") */
  brandLink?: string;
  /** Liste des liens pour défilement vers des sections */
  links?: NavLink[];
  /** Contenu à afficher à droite (Boutons de connexion, menu profil, etc.) */
  rightContent?: ReactNode;
  /** Contenu personnalisé pour le bas du menu mobile (ex: Bouton contact) */
  mobileBottomContent?: ReactNode;
  /** Classes CSS personnalisées pour le conteneur desktop */
  className?: string;
  /** Classes CSS personnalisées pour le conteneur mobile */
  classNameMobile?: string;
  /** Désactive le suivi automatique de la section active au scroll (@default false) */
  disableScrollTracking?: boolean;
  /** Place la navigation par-dessus le contenu (position absolue) (@default false) */
  overlayMode?: boolean;
}

/**
 * @see {@link https://vcomponents.tmenv.fr/?path=/docs/layout-nav--docs}
 */
export default function Nav({
  displayNav = true,
  title,
  brandName = "VOLCANIUM STUDIO",
  brandLink = "/",
  links = [],
  rightContent,
  mobileBottomContent,
  className,
  classNameMobile,
  disableScrollTracking = false,
  overlayMode = false,
}: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileHeaderRef = useRef<HTMLElement>(null);
  const manualScrollRef = useRef(false);

  useEffect(() => {
    const handle = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    if (links.length === 0 || disableScrollTracking) return;

    const navIds = links.map((l) => l.id).filter(Boolean) as string[];
    const handle = () => {
      if (manualScrollRef.current) return;

      if (window.scrollY <= 10) {
        setActiveSection("");
        return;
      }
      const offset = 80;
      let current = "";
      let minDist = Infinity;
      navIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        const dist = Math.abs(top - offset);
        if (top - offset <= 0 && dist < minDist) {
          minDist = dist;
          current = id;
        }
      });
      setActiveSection(current);
    };

    const onScrollEnd = () => {
      manualScrollRef.current = false;
      handle();
    };

    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    handle();

    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [links, disableScrollTracking]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [isMenuOpen]);

  const handleScrollTo = (sectionId: string) => {
    setIsMenuOpen(false);
    setActiveSection(sectionId);
    manualScrollRef.current = true;

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (!el) {
        manualScrollRef.current = false;
        return;
      }
      const navH = mobileHeaderRef.current?.offsetHeight ?? 0;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navH - 8,
        behavior: "smooth",
      });

      setTimeout(() => {
        manualScrollRef.current = false;
      }, 1000);
    }, 0);
  };

  const isStickyStyle = isScrolled;

  const menuMotion = isStickyStyle
    ? {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }
    : {
        initial: { height: 0 },
        animate: { height: "auto" },
        exit: { height: 0 },
        transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <>
      {/* HEADER MOBILE */}
      <header
        ref={mobileHeaderRef}
        className={`xl:hidden z-50 px-4 py-3 w-full ${classNameMobile || ""}`}
        style={{
          position: overlayMode ? (isStickyStyle ? "fixed" : "absolute") : (isStickyStyle ? "sticky" : "relative"),
          top: 0,
          left: 0,
          right: 0,
          transition: "background-color 0.4s, box-shadow 0.4s",
          ...(isStickyStyle
            ? {
                backgroundColor: "transparent",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 1px 24px rgba(0,0,0,0.45)",
              }
            : { backgroundColor: overlayMode ? "transparent" : "rgb(18,18,18)" }),
        }}
      >
        <div className="flex justify-between items-center w-full">
          <h1
            onClick={() => (window.location.href = brandLink)}
            className={`font-vc-title cursor-pointer text-vc-main transition-[font-size] duration-300 ${
              isStickyStyle ? "text-lg" : "text-xl"
            }`}
          >
            {brandName}
          </h1>

          <div className="flex items-center gap-3">
            {rightContent && (
              <div className="flex items-center gap-2">
                {rightContent}
              </div>
            )}
            
            {displayNav && links.length > 0 && (
              <motion.button
                onClick={() => setIsMenuOpen((p) => !p)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-vc-main overflow-hidden"
                whileTap={{ scale: 0.88 }}
                style={{
                  backgroundColor: isMenuOpen
                    ? "rgba(255,113,77,0.18)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="flex"
                    >
                      <IconX size={20} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="flex"
                    >
                      <IconMenu2 size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              key="nav"
              {...(menuMotion as any)}
              style={{
                overflow: isStickyStyle ? "visible" : "hidden",
                ...(isStickyStyle && {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "100%",
                  backgroundColor: "rgba(18,18,18,0.95)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
                  padding: "0.5rem 1rem 1rem",
                }),
              }}
              className={`flex z-10 flex-col gap-0.5 ${!isStickyStyle ? "pb-3" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {links.map((a, i) => (
                <motion.a
                  key={a.id || a.href || i}
                  href={a.href}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.048,
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    if (a.id) {
                      e.preventDefault();
                      handleScrollTo(a.id);
                    }
                  }}
                  className={`px-4 py-3 rounded-xl cursor-pointer active:text-vc-main text-sm font-medium transition-colors duration-200 block ${
                    (a.id && activeSection === a.id)
                      ? "text-vc-main bg-vc-container border-vc-main"
                      : "text-white/70 hover:text-vc-secondary hover:bg-white/5"
                  }`}
                >
                  {a.label}
                </motion.a>
              ))}

              {mobileBottomContent && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + links.length * 0.048,
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="mt-1.5 pt-2 border-t border-white/10 w-full"
                >
                  {mobileBottomContent}
                </motion.div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* HEADER DESKTOP */}
      <header
        className={`z-50 hidden xl:grid w-full grid-cols-3 items-center py-2 px-5 transition-all duration-500 ${
          overlayMode
            ? (isStickyStyle ? "fixed top-0 shadow-lg" : "absolute top-0 px-10 xl:px-5")
            : (isStickyStyle ? "sticky top-0 shadow-lg" : "relative bg-transparent px-10 xl:px-5")
        } ${className || ""}`}
        style={
          isStickyStyle
            ? {
                backgroundColor: "rgba(18,18,18,0.8)",
                backdropFilter: "blur(50px)",
                WebkitBackdropFilter: "blur(50px)",
              }
            : { backgroundColor: overlayMode ? "transparent" : "transparent" }
        }
      >
        <div>
          <h1
            onClick={() => (window.location.href = brandLink)}
            className={`font-vc-title cursor-pointer text-vc-main justify-self-start duration-300 text-xl`}
          >
            {brandName}
          </h1>
        </div>

        {displayNav && links.length > 0 ? (
          <nav className="flex gap-6 justify-self-center z-10">
            {links.map((a, i) => (
              <motion.a
                key={a.id || a.href || i}
                href={a.href}
                className={`whitespace-nowrap cursor-pointer rounded-lg transition-all px-3 py-0.5 duration-300 ${
                  (a.id && activeSection === a.id)
                    ? "text-vc-main bg-vc-container/50"
                    : "hover:bg-vc-container/40 active:text-vc-main hover:text-vc-secondary"
                }`}
                onClick={(e) => {
                  if (a.id) {
                    e.preventDefault();
                    handleScrollTo(a.id);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {a.label}
              </motion.a>
            ))}
          </nav>
        ) : (
          title && (
            <Center>
              <Title className="font-vc-secondary">{title}</Title>
            </Center>
          )
        )}

        <div className="z-50 flex items-center justify-end">
          <AnimatePresence mode="wait">
            {isScrolled ? (
              <motion.div
                key="up"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex justify-end"
              >
                <Button
                  className="transition-all duration-500"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <IconArrowUp />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="cta"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex justify-end"
              >
                {rightContent && (
                  <div className="flex gap-2">{rightContent}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
