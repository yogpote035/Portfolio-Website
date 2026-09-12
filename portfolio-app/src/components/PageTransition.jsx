import { motion, useReducedMotion } from 'framer-motion';

function PageTransition({ children, className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`page-transition ${className}`.trim()}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
