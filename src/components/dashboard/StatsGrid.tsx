import React from 'react';
import { Stat } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className={cn(
              "p-1.5 rounded-lg",
              stat.trend === 'up' ? "bg-emerald-50" : stat.trend === 'down' ? "bg-rose-50" : "bg-slate-50"
            )}>
              {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : 
               stat.trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-600" /> : 
               <Minus className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            <span className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded",
              stat.trend === 'up' ? "text-emerald-600 bg-emerald-50" : 
              stat.trend === 'down' ? "text-rose-600 bg-rose-50" : 
              "text-slate-500 bg-slate-100"
            )}>
              {stat.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
