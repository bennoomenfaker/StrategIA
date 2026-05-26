import { CheckCircle, XCircle, Clock, AlertCircle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface Props {
  jobs: any[];
}

export default function JobHistory({ jobs }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'RUNNING': return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Terminé</Badge>;
      case 'FAILED': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Échoué</Badge>;
      case 'RUNNING': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En cours</Badge>;
      default: return <Badge variant="outline">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-yellow-400" />
          Historique des collectes
        </CardTitle>
        <Badge variant="outline">{jobs.length} jobs</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Aucun job de collecte pour le moment</p>
          ) : (
            jobs.map((job, index) => (
              <div 
                key={job.id} 
                className="p-4 bg-card/50 rounded-xl hover:bg-card transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      {getStatusBadge(job.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.triggeredBy || 'MANUAL'} • {job.startedAt && new Date(job.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-card/80 rounded-lg">
                    <p className="text-lg font-bold text-white">{job.itemsCollected || 0}</p>
                    <p className="text-xs text-muted-foreground">Collectés</p>
                  </div>
                  <div className="text-center p-2 bg-card/80 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{job.itemsStored || 0}</p>
                    <p className="text-xs text-muted-foreground">Stockés</p>
                  </div>
                  <div className="text-center p-2 bg-card/80 rounded-lg">
                    <p className="text-lg font-bold text-orange-400">{job.itemsCollected && job.itemsStored ? job.itemsCollected - job.itemsStored : 0}</p>
                    <p className="text-xs text-muted-foreground">Filtrés</p>
                  </div>
                </div>

                {job.errorMessage && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{job.errorMessage}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
