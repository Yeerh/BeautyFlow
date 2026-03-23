import { motion } from "framer-motion";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

export function LandingIntro() {
  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B0B0B]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00C896]/14 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8C8DC]/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-[220px] items-center justify-center">
          <GooeyText
            texts={["Beauty", "BeautyFlow"]}
            morphTime={1.25}
            cooldownTime={0.45}
            className="min-w-[320px]"
            textClassName="text-[3.2rem] font-semibold tracking-[-0.06em] text-white sm:text-[4.75rem] lg:text-[5.75rem]"
          />
        </div>

        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.36em] text-white/42 sm:text-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Agendamento profissional para beleza
        </motion.p>
      </div>
    </motion.div>
  );
}
