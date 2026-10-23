import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectContainer } from '../store/containerSlice';
import type { ContainerStatus } from '../types/container';

const ContainerList = () => {
  const dispatch = useAppDispatch();
  const { containers, filterStatus, searchQuery, selectedContainerId } = useAppSelector((state) => state.containers);

  const filteredContainers = useMemo(() => {
    return containers.filter(c => {
      const statusMatch = filterStatus === 'ALL' || c.ai_analysis.status === filterStatus;
      const searchMatch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    }).sort((a, b) => b.ai_analysis.calculated_fill_rate - a.ai_analysis.calculated_fill_rate);
  }, [containers, filterStatus, searchQuery]);

  const getStatusColor = (status: ContainerStatus) => {
    switch (status) {
      case 'CRITICAL': return 'bg-rose-500';
      case 'WARNING': return 'bg-amber-500';
      case 'NORMAL': return 'bg-emerald-500';
      case 'EMPTY': return 'bg-teal-500';
    }
  };

  const getStatusLabel = (status: ContainerStatus) => {
    switch (status) {
      case 'CRITICAL': return 'Kritik';
      case 'WARNING': return 'Uyarı';
      case 'NORMAL': return 'Normal';
      case 'EMPTY': return 'Boş';
    }
  };

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-emerald-800/30">
        <h2 className="text-lg font-semibold text-white">Konteynır Listesi</h2>
        <p className="text-sm text-emerald-300/60">{filteredContainers.length} konteynır listeleniyor</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredContainers.map(container => {
          const fillRate = container.ai_analysis.calculated_fill_rate;
          const status = container.ai_analysis.status;
          const isSelected = selectedContainerId === container.id;

          return (
            <div
              key={container.id}
              onClick={() => dispatch(selectContainer(container.id))}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border bg-emerald-950/30 hover:bg-emerald-900/40
                ${isSelected ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-emerald-700/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white text-sm">{container.name}</h3>
                  <p className="text-xs text-emerald-400/50 mt-0.5">{container.code} • {container.district}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusColor(status)} text-white`}>
                  {getStatusLabel(status)}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-emerald-300/60">Doluluk</span>
                  <span className="font-semibold text-white">%{fillRate}</span>
                </div>
                <div className="fill-bar-track">
                  <div
                    className={`fill-bar-fill ${getStatusColor(status)}`}
                    style={{ width: `${fillRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-2.5 flex justify-between items-center">
                <span className="text-[10px] text-emerald-500/40">{container.items.length} nesne tespit edildi</span>
                <span className="text-[10px] text-emerald-500/40">Son: {container.ai_analysis.last_ai_scan}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContainerList;
