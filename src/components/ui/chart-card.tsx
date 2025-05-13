import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md p-6',
        className
      )}
    >
      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        {title}
      </h2>
      <div className="h-[280px]">
        {children}
      </div>
    </div>
  );
} 