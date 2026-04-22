import type { ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { fadeUp } from '../../lib/motion';

interface RevealProps {
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'aside';
  variants?: Variants;
  delay?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}

export function Reveal({
  children,
  as = 'div',
  variants = fadeUp,
  delay = 0,
  amount = 0.25,
  once = true,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
