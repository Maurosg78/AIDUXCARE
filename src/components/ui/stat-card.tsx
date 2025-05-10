import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  trend,
  subtitle,
  className
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {trend && (
              <div className="flex items-center mt-1">
                <span
                  className={cn(
                    "text-xs font-medium mr-1",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpIcon className="inline h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="inline h-3 w-3 mr-0.5" />
                  )}
                  {trend.value}%
                </span>
              </div>
            )}
            
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {Icon && (
            <div className={cn("rounded-full p-3 bg-blue-50", iconColor.replace('text-', 'bg-').replace('500', '50'))}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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