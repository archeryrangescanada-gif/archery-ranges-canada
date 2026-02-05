import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    color?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = 'emerald' }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-stone-500">{label}</p>
                    <p className="text-2xl font-bold text-stone-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                    <span className="text-stone-500 ml-2">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
