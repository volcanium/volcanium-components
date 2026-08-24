import React, { ReactNode } from "react";
import Stage from "./Stage";

export interface RoadMapItem {
  
  title: string;
  
  content: ReactNode;
  
  sideContent?: ReactNode;
  
  done?: boolean;
}

export interface RoadMapProps {
  
  stages: RoadMapItem[];
  
  className?: string;
}

export default function RoadMap({ stages = [], className = "" }: RoadMapProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className={`text-center text-white/50 p-8 ${className}`}>
        Aucune étape n'a été ajoutée à la roadmap.
      </div>
    );
  }

  const lastDoneIndex = stages.reduce(
    (last, stage, i) => (stage.done ? i : last),
    -1,
  );
  let progressPercentage = 0;
  if (stages.length > 0) {
    if (lastDoneIndex === stages.length - 1) {
      progressPercentage = 100;
    } else if (lastDoneIndex >= 0) {
      progressPercentage = ((lastDoneIndex + 1.55) / stages.length) * 100;
    }
  }

  return (
    <>
      {}
      <div className={`flex lg:hidden flex-row items-stretch gap-2 w-full px-4 mx-auto max-w-lg ${className}`}>
        
        {}
        <div className="relative w-1.5 sm:w-2 self-stretch flex-shrink-0 rounded-2xl bg-contaner overflow-hidden my-6">
          <div
            className="w-full top-0 left-0 rounded-2xl bg-gradient-to-b from-main from-[69%] to-transparent absolute"
            style={{
              height: `${progressPercentage}%`,
              transition: "height 1s ease-out",
            }}
          />
        </div>

        {}
        <div className="flex flex-col flex-1 gap-12 py-4">
          {stages.map((stage, i) => (
            <div key={`mobile-${i}`} className="flex flex-col gap-6">
              {stage.sideContent && (
                <div className="flex items-center justify-center w-full">
                  {stage.sideContent}
                </div>
              )}
              <Stage
                className="w-full text-base ml-1"
                count={i + 1}
                title={stage.title}
                done={stage.done}
              >
                {stage.content}
              </Stage>
            </div>
          ))}
        </div>
      </div>

      {}
      <div
        className={`hidden lg:flex flex-row items-stretch justify-center gap-2 sm:gap-5 w-full mx-auto max-w-6xl ${className}`}
      >
        {}
        <div className="flex flex-col flex-1 items-end">
          {stages.map((stage, i) => (
            <div
              key={`left-${i}`}
              className="flex items-center justify-center min-h-50 w-150 p-2 sm:p-4"
            >
              {i % 2 === 0 ? (
                <Stage
                  className={`pl-8 sm:pl-12 py-4 pr-4 sm:pr-4 w-120 text-base sm:text-xl`}
                  count={i + 1}
                  title={stage.title}
                  done={stage.done}
                >
                  {stage.content}
                </Stage>
              ) : (
                stage.sideContent || null
              )}
            </div>
          ))}
        </div>

        {}
        <div className="relative w-1.5 sm:w-2 self-stretch flex-shrink-0 rounded-2xl bg-contaner overflow-hidden">
          <div
            className="w-full top-0 left-0 rounded-2xl bg-gradient-to-b from-main from-[69%] to-transparent absolute"
            style={{
              height: `${progressPercentage}%`,
              transition: "height 1s ease-out",
            }}
          />
        </div>

        {}
        <div className="flex flex-col flex-1 items-start">
          {stages.map((stage, i) => (
            <div
              key={`right-${i}`}
              className="flex items-center justify-center min-h-[200px] w-full max-w-[600px] p-2 sm:p-4"
            >
              {i % 2 !== 0 ? (
                <Stage
                  className="pl-8 sm:pl-12 py-4 pr-4 sm:pr-4 text-base w-120 sm:text-xl"
                  count={i + 1}
                  title={stage.title}
                  done={stage.done}
                >
                  {stage.content}
                </Stage>
              ) : (
                <div
                  key={`left-${i}`}
                  className="flex items-center justify-center min-h-50 w-150 p-2 sm:p-4"
                >
                  {stage.sideContent || null}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
