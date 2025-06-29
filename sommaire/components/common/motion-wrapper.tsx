'use client';

import React from 'react';
import { motion } from 'framer-motion';

// interface MotionProps {
//   children: React.ReactNode;
//   className?: string;
// }

// export const MotionSection: React.FC<MotionProps> = ({ children, className }) => {
//   return (
//     <motion.section
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className={className}
//     >
//       {children}
//     </motion.section>
//   );
// };

export const MotionDiv = motion.div;

export const MotionSection = motion.section;

export const MotionH1 = motion.h1;

export const MotionH2 = motion.h2;

export const MotionH3 = motion.h3;

export const MotionP = motion.p;

export const MotionSpan = motion.span;