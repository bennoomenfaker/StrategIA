import { Rss, Globe, FileText, BarChart3 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  color: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-card/50 rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

interface Props {
  results: any;
  plan: any;
}

export default function StatsCards({ results, plan }: Props) {
  if (!results) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Items collectés"
        value={results.items?.length || 0}
        subtitle="Total items"
        icon={Rss}
        color="text-blue-400"
      />
      <StatCard
        title="Mots uniques"
        value={results.wordCloud?.length || 0}
        subtitle="Dans le nuage"
        icon={BarChart3}
        color="text-green-400"
      />
      <StatCard
        title="Sources actives"
        value={plan?.sources?.filter((s: any) => s.isActive).length || 0}
        subtitle="Configurées"
        icon={Globe}
        color="text-purple-400"
      />
      <StatCard
        title="Mots-clés"
        value={plan?.keywords?.length || 0}
        subtitle="Filtrage"
        icon={FileText}
        color="text-orange-400"
      />
    </div>
  );
}
