import React from "react";
import { motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export default function PageTransition({ children, id, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} // Elegant custom cubic-bezier for snappy yet smooth transition
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
