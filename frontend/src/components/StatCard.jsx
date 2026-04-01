import { useEffect, useRef } from 'react';
import { animate, motion } from 'framer-motion';

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v);
      },
    });
    return controls.stop;
  }, [value]);
  return <span ref={ref}>0</span>;
}

const itemVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function StatCard({ label, value, colorClass = 'text-blue', sub1, sub2 }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-navy-light border border-slate-600 rounded-card p-6 text-center shadow-lg"
    >
      <div className={`text-4xl font-bold ${colorClass}`}>
        <AnimatedCounter value={value} />
      </div>
      <div className="text-sm text-slate-400 mt-2 uppercase tracking-wider">{label}</div>
      {(sub1 || sub2) && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-around text-xs text-slate-400">
          {sub1 && <span>{sub1.label}: <strong className="text-slate-200">{sub1.value}</strong></span>}
          {sub2 && <span>{sub2.label}: <strong className="text-slate-200">{sub2.value}</strong></span>}
        </div>
      )}
    </motion.div>
  );
}
