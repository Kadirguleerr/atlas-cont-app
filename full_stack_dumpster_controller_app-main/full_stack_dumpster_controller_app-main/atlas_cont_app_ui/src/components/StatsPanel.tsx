import { useAppSelector } from '../store/hooks';

const StatsPanel = () => {
  const { containers } = useAppSelector((state) => state.containers);

  const total = containers.length;
  const avgFill = total > 0 ? Math.round(containers.reduce((acc, c) => acc + c.ai_analysis.calculated_fill_rate, 0) / total) : 0;
  const criticalCount = containers.filter(c => c.ai_analysis.status === 'CRITICAL').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mb-6">
      {/* Total */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-300/70 text-sm font-medium mb-1">Toplam Konteynır</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      {/* Avg Fill */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-300/70 text-sm font-medium mb-1">Ortalama Doluluk</p>
          <p className="text-3xl font-bold text-white">%{avgFill}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      {/* Critical */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-emerald-300/70 text-sm font-medium mb-1">Kritik Durum</p>
          <p className={`text-3xl font-bold ${criticalCount > 0 ? 'text-rose-400' : 'text-white'}`}>{criticalCount}</p>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
