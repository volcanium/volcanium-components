import { Fragment, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import Title from "./Title";
import { useLanguage } from "../../utils/useLanguage";

export interface StepperItem {
  title: string;
  content: ReactNode;
  /** Only used by the `"zigzag"` layout, rendered alongside the step on the opposite column. */
  sideContent?: ReactNode;
  done?: boolean;
}

export interface StepperProps {
  stages: StepperItem[];
  /**
   * `"linear"`: single column with a connecting bar between steps (former `Cursus`).
   * `"zigzag"`: responsive alternating layout with a progress rail (former `RoadMap`).
   */
  layout?: "linear" | "zigzag";
  className?: string;
}

interface StepCardProps {
  title: string;
  count: number | string;
  children: ReactNode;
  className?: string;
  done?: boolean;
}

function StepCard({ children, title, count, className = "", done = false }: StepCardProps) {
  const { t } = useLanguage();
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col relative">
      <div
        className={`absolute ${done ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-main/50 blur-[70px] rounded-[100%] z-0 pointer-events-none`}
      />
      <motion.div
        className={`p-6 sm:p-8 pl-10 sm:pl-14 rounded-2xl relative z-10 transition-colors duration-300 bg-container ${className}`}
        whileHover={{ translateY: -5 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${done ? "border-main" : "border-transparent"} pointer-events-none`}
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at 15px 10px, transparent 45px, black 46px)",
            maskImage:
              "radial-gradient(circle at 15px 10px, transparent 45px, black 46px)",
          }}
        />
        <div
          className={`transition-all duration-300 ${done ? "scale-100 opacity-100" : "scale-50 opacity-0"} px-5 py-0.5 text-sm bg-main rounded-lg -mt-10 absolute top-12 right-2`}
        >
          {t("stepper_done")}
        </div>
        <h1
          className={`absolute -top-6 -left-2 text-5xl sm:text-7xl font-secondary text-main font-bold duration-500 origin-bottom-left flex items-center justify-center z-20 ${
            hover ? "scale-110" : "scale-100"
          }`}
        >
          {count}
        </h1>
        <div className="flex flex-row justify-between items-center">
          <Title>{title}</Title>
        </div>
        <div className="mt-2 text-white/80">{children}</div>
      </motion.div>
    </div>
  );
}

function LinearStepper({ stages, className }: { stages: StepperItem[]; className: string }) {
  return (
    <div className={`flex flex-col max-w-2xl w-full mx-auto ${className}`}>
      {stages.map((stage, index) => (
        <Fragment key={index}>
          <StepCard count={index + 1} title={stage.title} done={stage.done}>
            {stage.content}
          </StepCard>
          {index < stages.length - 1 && (
            <div className="flex justify-center w-full">
              <div className="h-24 w-1 bg-container -my-6 relative z-0" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * The progress rail fills to `(lastDoneIndex + PROGRESS_LEAD) / stages.length`
 * instead of stopping exactly at the last done step: filling only up to the
 * done step's own boundary reads visually as "this step isn't finished yet"
 * because the bar's leading edge lines up with the top of that step's card.
 * Overshooting partway into the next segment makes the fill visibly pass the
 * completed step before stopping, which reads as "done" rather than
 * "in progress here".
 */
const PROGRESS_LEAD = 1.55;

function ZigzagStepper({ stages, className }: { stages: StepperItem[]; className: string }) {
  const lastDoneIndex = stages.reduce(
    (last, stage, i) => (stage.done ? i : last),
    -1,
  );
  let progressPercentage = 0;
  if (stages.length > 0) {
    if (lastDoneIndex === stages.length - 1) {
      progressPercentage = 100;
    } else if (lastDoneIndex >= 0) {
      progressPercentage = ((lastDoneIndex + PROGRESS_LEAD) / stages.length) * 100;
    }
  }

  const progressRail = (extraClassName: string) => (
    <div
      className={`relative w-1.5 sm:w-2 self-stretch flex-shrink-0 rounded-2xl bg-container overflow-hidden ${extraClassName}`}
    >
      <div
        className="w-full top-0 left-0 rounded-2xl bg-gradient-to-b from-main from-[69%] to-transparent absolute"
        style={{
          height: `${progressPercentage}%`,
          transition: "height 1s ease-out",
        }}
      />
    </div>
  );

  return (
    <>
      <div
        className={`flex lg:hidden flex-row items-stretch gap-2 w-full px-4 mx-auto max-w-lg ${className}`}
      >
        {progressRail("my-6")}
        <div className="flex flex-col flex-1 gap-12 py-4">
          {stages.map((stage, i) => (
            <div key={`mobile-${i}`} className="flex flex-col gap-6">
              {stage.sideContent && (
                <div className="flex items-center justify-center w-full">
                  {stage.sideContent}
                </div>
              )}
              <StepCard className="w-full text-base ml-1" count={i + 1} title={stage.title} done={stage.done}>
                {stage.content}
              </StepCard>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`hidden lg:flex flex-row items-stretch justify-center gap-2 sm:gap-5 w-full mx-auto max-w-6xl ${className}`}
      >
        <div className="flex flex-col flex-1 items-end">
          {stages.map((stage, i) => (
            <div key={`left-${i}`} className="flex items-center justify-center min-h-50 w-150 p-2 sm:p-4">
              {i % 2 === 0 ? (
                <StepCard
                  className="pl-8 sm:pl-12 py-4 pr-4 sm:pr-4 w-120 text-base sm:text-xl"
                  count={i + 1}
                  title={stage.title}
                  done={stage.done}
                >
                  {stage.content}
                </StepCard>
              ) : (
                stage.sideContent || null
              )}
            </div>
          ))}
        </div>

        {progressRail("")}

        <div className="flex flex-col flex-1 items-start">
          {stages.map((stage, i) => (
            <div key={`right-${i}`} className="flex items-center justify-center min-h-[200px] w-full max-w-[600px] p-2 sm:p-4">
              {i % 2 !== 0 ? (
                <StepCard
                  className="pl-8 sm:pl-12 py-4 pr-4 sm:pr-4 text-base w-120 sm:text-xl"
                  count={i + 1}
                  title={stage.title}
                  done={stage.done}
                >
                  {stage.content}
                </StepCard>
              ) : (
                <div className="flex items-center justify-center min-h-50 w-150 p-2 sm:p-4">
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

export default function Stepper({ stages = [], layout = "linear", className = "" }: StepperProps) {
  const { t } = useLanguage();

  if (!stages || stages.length === 0) {
    return (
      <div className={`text-center text-white/50 p-8 ${className}`}>
        {layout === "zigzag" ? t("stepper_empty_roadmap") : t("stepper_empty_cursus")}
      </div>
    );
  }

  return layout === "zigzag" ? (
    <ZigzagStepper stages={stages} className={className} />
  ) : (
    <LinearStepper stages={stages} className={className} />
  );
}
