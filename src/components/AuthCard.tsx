import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const AuthCard = ({ children, title }: { children: ReactNode; title: string }) => (
  <div className="grid min-h-screen place-items-center p-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </motion.div>
  </div>
);
