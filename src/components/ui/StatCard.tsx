import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md p-6 relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="w-6 h-6 text-slate-600" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </div>
        <div className="p-2 bg-slate-100 rounded-lg">
          <div className="w-6 h-6 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
} 