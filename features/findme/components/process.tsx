"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type ProcessStep = {
  title: string;
  description: string;
};

export type ProcessCopy = {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
};

export function FindMeProcess({ copy }: { copy: ProcessCopy }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="workflow"
      ref={containerRef}
      className="relative overflow-hidden space-y-10 rounded-[44px] border border-white/10 bg-[rgba(5,7,12,0.85)] px-6 py-12 text-white backdrop-blur-2xl md:px-12 shadow-2xl"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 space-y-4 text-center"
      >
        <p className="text-sm uppercase tracking-[0.5em] text-[#7F8CA8]">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {copy.title}
        </h2>
      </motion.div>

      <div className="relative z-10 mt-12 grid gap-6 md:grid-cols-2">
        {copy.steps.map((step, index) => (
          <ProcessCard key={step.title} step={step} index={index} isInView={isInView} />
        ))}
      </div>
    </section>
  );
}

function ProcessCard({ step, index, isInView }: { step: ProcessStep; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-white/5 via-[#070c16]/50 to-[#050812]/80 p-8 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300"
    >
      <div className="absolute inset-px rounded-[28px] border border-white/5 group-hover:border-white/10 transition-colors" />
      
      {/* Hover Glow Effect */}
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            index % 2 === 0
              ? "rgba(25,255,199,0.15)"
              : "rgba(155,79,255,0.15)",
        }}
      />

      <div className="relative space-y-4 z-10">
        <div className="flex items-center gap-4 text-xl uppercase tracking-[0.25em] text-[#9FB2D7]">
          <span className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-base font-semibold text-white transition-all duration-300",
            "group-hover:scale-110 group-hover:border-[#19FFC7]/50 group-hover:text-[#19FFC7]"
          )}>
            {index + 1}
          </span>
          <span className="group-hover:text-white transition-colors">{step.title}</span>
        </div>
        <p className="text-base text-[#C7D6F3] group-hover:text-[#E2E8F0] transition-colors">
          {step.description}
        </p>
      </div>
      
      {/* Permanent subtle glow */}
      <div
        className="pointer-events-none absolute -right-6 top-6 h-24 w-24 rounded-full blur-[70px] opacity-40"
        style={{
          background:
            index % 3 === 0
              ? "rgba(25,255,199,0.25)"
              : index % 3 === 1
              ? "rgba(0,174,239,0.25)"
              : "rgba(155,79,255,0.25)",
        }}
      />
    </motion.div>
  );
}

