"use client";

import { motion } from "motion/react";
import { CarFront, Flag, CircleDot } from "lucide-react";

type JourneyProgressProps = {
  step: number;
  totalSteps?: number;
};

const STEP_LABELS = [
  "Accueil",
  "Client",
  "Trajet",
  "Coordonnées",
  "Récap",
];

export default function JourneyProgress({
  step,
  totalSteps = 5,
}: JourneyProgressProps) {
  const clampedStep = Math.max(1, Math.min(step, totalSteps));
  const progress = ((clampedStep - 1) / (totalSteps - 1)) * 100;
  const labels = STEP_LABELS.slice(0, totalSteps);

  return (
    <>
      {/* MOBILE */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:hidden">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-900/85 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Progression
            </span>
          </div>

          <div className="relative px-2">
            {/* route */}
            <div className="relative h-1 rounded-full bg-slate-700">
              <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="h-1 rounded-full bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.55)]"
              />
            </div>

            {/* points */}
            <div className="relative mt-0 h-0">
              {labels.map((label, index) => {
                const dotProgress = (index / (totalSteps - 1)) * 100;
                const isActive = clampedStep === index + 1;
                const isDone = clampedStep > index + 1;

                return (
                  <div
                    key={label}
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${dotProgress}%` }}
                  >
                    <div className="relative -translate-y-1/2">
                      <div
                        className={[
                          "h-4 w-4 rounded-full border transition-all",
                          isActive
                            ? "border-green-400 bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.65)]"
                            : isDone
                            ? "border-green-500 bg-green-500"
                            : "border-slate-500 bg-slate-900",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                );
              })}

              {/* taxi mobile */}
              <motion.div
                initial={false}
                animate={{
                  left: `${progress}%`,
                  y: [0, -1.5, 0, 1.5, 0],
                }}
                transition={{
                  left: { type: "spring", stiffness: 120, damping: 18 },
                  y: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute top-0 z-10 -translate-x-1/2"
              >
                <div className="-translate-y-[150%]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-400 text-black shadow-[0_10px_30px_rgba(74,222,128,0.35)]">
                    <CarFront size={18} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* labels */}
            <div className="relative mt-5 h-8">
              {labels.map((label, index) => {
                const dotProgress = (index / (totalSteps - 1)) * 100;
                const isActive = clampedStep === index + 1;
                const isDone = clampedStep > index + 1;

                return (
                  <div
                    key={`${label}-text`}
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${dotProgress}%` }}
                  >
                    <span
                      className={[
                        "block w-[62px] text-center text-[10px] leading-tight",
                        isActive || isDone ? "text-white" : "text-slate-500",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex justify-center">
              <span className="text-xs font-semibold text-green-400">
                Étape {clampedStep}/{totalSteps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="pointer-events-none fixed right-6 top-1/2 z-50 hidden h-[78vh] w-44 -translate-y-1/2 md:block">
        <div className="relative h-full w-full">
          <div className="absolute inset-y-0 left-[62px] w-[18px] rounded-full bg-slate-900/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
          <div className="absolute inset-y-3 left-[70px] border-l-2 border-dashed border-slate-600" />

          <motion.div
            className="absolute left-[62px] top-0 w-[18px] rounded-full bg-gradient-to-b from-green-400/90 to-green-300/70 shadow-[0_0_30px_rgba(74,222,128,0.25)]"
            initial={false}
            animate={{ height: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />

          {labels.map((label, index) => {
            const dotProgress = (index / (totalSteps - 1)) * 100;
            const isActive = clampedStep === index + 1;
            const isDone = clampedStep > index + 1;

            return (
              <div
                key={label}
                className="absolute left-0"
                style={{ top: `${dotProgress}%`, transform: "translateY(-50%)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "min-w-[52px] text-right text-xs font-medium tracking-wide transition-colors",
                      isActive || isDone ? "text-white" : "text-slate-500",
                    ].join(" ")}
                  >
                    {label}
                  </div>

                  <div
                    className={[
                      "relative flex h-7 w-7 items-center justify-center rounded-full border transition-all",
                      isActive
                        ? "border-green-400 bg-green-400 text-black shadow-[0_0_18px_rgba(74,222,128,0.7)]"
                        : isDone
                        ? "border-green-500 bg-green-500/90 text-black"
                        : "border-slate-600 bg-slate-950 text-slate-500",
                    ].join(" ")}
                  >
                    <CircleDot size={14} />
                  </div>
                </div>
              </div>
            );
          })}

          <motion.div
            initial={false}
            animate={{
              top: `${progress}%`,
              y: [0, -2, 0, 2, 0],
              rotate: [0, -1, 0, 1, 0],
            }}
            transition={{
              top: { type: "spring", stiffness: 120, damping: 18 },
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute left-[71px] z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-35" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-green-400 text-black shadow-[0_18px_45px_rgba(74,222,128,0.35)]">
                <CarFront size={24} />
              </div>
            </div>
          </motion.div>

          <div className="absolute -bottom-4 left-[71px] -translate-x-1/2">
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
                <Flag size={18} />
              </div>
              <span className="text-xs font-medium tracking-wide text-slate-400">
                Arrivée
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}