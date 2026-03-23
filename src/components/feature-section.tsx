import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: readonly Feature[];
  className?: string;
  title?: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={cn("p-8 md:p-12", className)}>
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>

        <div className="mt-10 flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-5 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.45 }}
                transition={{ duration: 0.45 }}
              >
                <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20">
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full",
                      index === currentFeature ? "bg-[#00C896]/16" : "bg-transparent",
                    )}
                    animate={{ scale: index === currentFeature ? 1 : 0.88 }}
                    transition={{ duration: 0.4 }}
                  />
                  <span
                    className={cn(
                      "relative text-sm font-semibold",
                      index === currentFeature ? "text-[#00C896]" : "text-white/55",
                    )}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
                      {feature.step}
                    </p>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="h-full rounded-full bg-[#00C896]"
                        animate={{
                          width:
                            index === currentFeature ? `${progress}%` : index < currentFeature ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.2, ease: "linear" }}
                      />
                    </div>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold text-white md:text-2xl">
                    {feature.title || feature.step}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/68 md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={cn(
              "order-1 relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_28px_100px_rgba(0,0,0,0.32)] md:order-2",
              imageHeight,
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={feature.step}
                      className="absolute inset-0 overflow-hidden rounded-[inherit]"
                      initial={{ y: 80, opacity: 0, rotateX: -12 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -80, opacity: 0, rotateX: 12 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.title || feature.step}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08),rgba(11,11,11,0.7))]" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
                          {feature.step}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {feature.title || feature.step}
                        </p>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
