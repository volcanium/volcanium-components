import React, { ReactNode } from "react";

export interface HeroProps {
  
  img: string;
  
  children?: ReactNode;
  
  darkened?: number;
  
  bottom?: ReactNode;
  
  className?: string;
}

export default function Hero({
  img,
  children,
  darkened = 0,
  bottom,
  className = "",
}: HeroProps) {
  
  const opacity = Math.max(0, Math.min(100, darkened)) / 100;

  return (
    <section
      className={`relative w-full min-h-[100dvh] flex flex-col items-center justify-between overflow-hidden bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${img})` }}
    >
      {}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
      />

      {}
      <div className="flex-1 w-full flex items-center justify-center z-10 relative p-4">
        {children}
      </div>

      {}
      {bottom && (
        <div className="w-full flex justify-center pb-8 max-sm:pb-[max(2rem,env(safe-area-inset-bottom))] p-4 z-10 relative">
          {bottom}
        </div>
      )}
    </section>
  );
}
