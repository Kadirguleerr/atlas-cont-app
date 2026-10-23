import { Link } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilterStatus, setSearchQuery, simulateAllContainers, addRandomTrashToAll } from '../store/containerSlice';
import type { ContainerStatus } from '../types/container';

const Header = () => {
  const dispatch = useAppDispatch();
  const { filterStatus, searchQuery, simulateAllLoading, addTrashAllLoading } = useAppSelector((state) => state.containers);

  const statuses: (ContainerStatus | 'ALL')[] = ['ALL', 'EMPTY', 'NORMAL', 'WARNING', 'CRITICAL'];

  return (
    <header className="sticky top-0 z-[50] glass-card mx-4 mt-4 mb-6 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        <h1 className="text-xl font-bold tracking-tight text-white mr-4">Atlas Container Monitor</h1>
        
        <Link 
          to="/create"
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Konteyner
        </Link>

        <button 
          onClick={() => dispatch(simulateAllContainers())}
          disabled={simulateAllLoading}
          className="ml-4 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
        >
          {simulateAllLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Güncelleniyor...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Simüle Et
            </>
          )}
        </button>

        <button 
          onClick={() => dispatch(addRandomTrashToAll())}
          disabled={addTrashAllLoading}
          className="ml-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
        >
          {addTrashAllLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Ekleniyor...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tümüne Çöp Ekle
            </>
          )}
        </button>
      </div>

      <div className="flex-1 w-full max-w-md mx-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-emerald-700/30 rounded-lg bg-emerald-950/50 text-emerald-50 placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Konteynır ara..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {statuses.map((status) => {
          let baseClasses = "px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ";
          let colorClasses = "";
          
          if (status === filterStatus) {
             if (status === 'ALL') colorClasses = "bg-gradient-to-r from-emerald-600 to-teal-600 text-white";
             if (status === 'EMPTY') colorClasses = "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.4)]";
             if (status === 'NORMAL') colorClasses = "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]";
             if (status === 'WARNING') colorClasses = "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]";
             if (status === 'CRITICAL') colorClasses = "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]";
          } else {
             if (status === 'ALL') colorClasses = "text-emerald-400/60 hover:bg-emerald-800/30";
             if (status === 'EMPTY') colorClasses = "text-emerald-400/60 hover:bg-emerald-800/30";
             if (status === 'NORMAL') colorClasses = "text-emerald-400/60 hover:bg-emerald-800/30";
             if (status === 'WARNING') colorClasses = "text-emerald-400/60 hover:bg-emerald-800/30";
             if (status === 'CRITICAL') colorClasses = "text-emerald-400/60 hover:bg-emerald-800/30";
          }

          return (
            <button
              key={status}
              onClick={() => dispatch(setFilterStatus(status))}
              className={baseClasses + colorClasses}
            >
              {status}
            </button>
          )
        })}
      </div>
    </header>
  );
};

export default Header;
