"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.55 }}
      transition={{ delay: 1.1, duration: 0.7 }}
      className="
        absolute
        bottom-7
        left-1/2
        z-20
        hidden
        -translate-x-1/2
        flex-col
        items-center
        gap-1.5
        text-[#f5f0eb]/45
        md:flex
      "
    >
      <span className="text-[9px] uppercase tracking-[0.24em]">
        Scroll
      </span>

      <motion.svg
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </motion.svg>
    </motion.div>
  );
}