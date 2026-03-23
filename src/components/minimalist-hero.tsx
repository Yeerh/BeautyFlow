import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MinimalistHeroProps {
  id?: string;
  logoText: string;
  navLinks: readonly { label: string; href: string }[];
  leadText?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  headerAction?: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-xs font-semibold tracking-[0.28em] text-white/55 transition-colors duration-300 hover:text-white"
  >
    {children}
  </a>
);

export const MinimalistHero = ({
  id,
  logoText,
  navLinks,
  leadText,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt,
  overlayText,
  headerAction,
  className,
}: MinimalistHeroProps) => {
  return (
    <section
      id={id}
      className={cn(
        "relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0B0B0B] px-6 pb-10 pt-8 text-white md:px-10 lg:px-12",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[8rem] h-72 w-72 rounded-full bg-[#00C896]/14 blur-3xl" />
        <div className="absolute right-[-5rem] top-[-3rem] h-72 w-72 rounded-full bg-[#F8C8DC]/12 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-white/6 blur-3xl" />
      </div>

      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-6 border-b border-white/8 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="text-lg font-semibold tracking-[0.18em] text-white sm:text-xl"
        >
          {logoText}
        </motion.div>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="flex items-center gap-3"
        >
          {headerAction}
        </motion.div>
      </header>

      <div className="relative z-20 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_0.8fr_0.9fr] lg:gap-14 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="order-2 max-w-xl text-center lg:order-1 lg:text-left"
        >
          {leadText ? (
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#00C896]">
              {leadText}
            </p>
          ) : null}

          <div className="mt-5 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </div>

          <div className="mt-6 max-w-lg text-base leading-8 text-white/68 sm:text-lg">
            {description}
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row lg:justify-start">
            {primaryAction}
            {secondaryAction}
          </div>
        </motion.div>

        <div className="relative order-1 flex items-center justify-center lg:order-2">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="absolute z-0 h-[17rem] w-[17rem] rounded-full bg-[#00C896]/24 md:h-[23rem] md:w-[23rem] lg:h-[30rem] lg:w-[30rem]"
          />
          <div className="absolute z-0 h-[10rem] w-[10rem] translate-x-[7.5rem] translate-y-[-6rem] rounded-[2rem] bg-[#F8C8DC]/24 blur-xl md:translate-x-[9rem] lg:h-[12rem] lg:w-[12rem]" />
          <motion.img
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto w-auto max-h-[22rem] max-w-[16rem] rounded-[2rem] border border-white/10 object-cover object-center shadow-[0_30px_120px_rgba(0,0,0,0.34)] sm:max-h-[28rem] sm:max-w-[21rem] lg:max-h-[35rem] lg:max-w-[24rem]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.28 }}
          className="order-3 text-center lg:text-right"
        >
          <div className="text-6xl font-extrabold uppercase leading-[0.86] tracking-[-0.08em] text-white/8 sm:text-7xl lg:text-[8.5rem]">
            {overlayText.part1}
            <br />
            <span className="text-[#F8C8DC]/22">{overlayText.part2}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
