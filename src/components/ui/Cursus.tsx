import React, { ReactNode } from "react";
import Stage from "./Stage";
import Center from "../layout/Center";

export interface CursusItem {
  title: string;
  content: ReactNode;
  done?: boolean;
}

export interface CursusProps {
  
  stages: CursusItem[];
  
  className?: string;
}

export default function Cursus({ stages = [], className = "" }: CursusProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className={`text-center text-white/50 p-8 ${className}`}>
        Aucune étape n'a été ajoutée au cursus.
      </div>
    );
  }

  return (
    <div className={`flex flex-col max-w-2xl w-full mx-auto ${className}`}>
      {stages.map((stage, index) => (
        <React.Fragment key={index}>
          <Stage
            count={index + 1}
            title={stage.title}
            done={stage.done}
          >
            {stage.content}
          </Stage>
          {index < stages.length - 1 && (
            <div className="flex justify-center w-full">
              <div className="h-24 w-1 bg-contaner -my-6 relative z-0" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
