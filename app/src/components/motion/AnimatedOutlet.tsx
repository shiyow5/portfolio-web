import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';
import { routeTransition } from '../../lib/motion';

export function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{element}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={routeTransition}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
