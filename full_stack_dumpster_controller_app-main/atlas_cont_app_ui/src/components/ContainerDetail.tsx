import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectContainer, addRandomTrash, deleteContainer } from '../store/containerSlice';
import type { ContainerStatus, ItemCategory } from '../types/container';
import ContainerFullModal from './ContainerFullModal';

const ContainerDetail = () => {
  const dispatch = useAppDispatch();
  const { containers, selectedContainerId } = useAppSelector((state) => state.containers);
  const [isAddingTrash, setIsAddingTrash] = useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

  const container = containers.find(c => c.id === selectedContainerId);

  if (!container) return null;


  const handleAddTrash = () => {
    if (container.ai_analysis.calculated_fill_rate >= 100) {
      setIsFullModalOpen(true);
      return;
    }

    setIsAddingTrash(true);
    dispatch(addRandomTrash(container.id))
      .unwrap()
      .finally(() => {
        setIsAddingTrash(false);
      });
  };

  const handleDelete = () => {
    if (window.confirm(`${container.code} kodlu konteyneri silmek istediğinize emin misiniz?`)) {
      dispatch(deleteContainer(container.id));
    }
  };

  const getStatusColor = (status: ContainerStatus) => {
    switch (status) {
      case 'CRITICAL': return 'bg-rose-500 text-white';
      case 'WARNING': return 'bg-amber-500 text-white';
      case 'NORMAL': return 'bg-emerald-500 text-white';
      case 'EMPTY': return 'bg-teal-500 text-white';
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

  const getCategoryColor = (category: ItemCategory) => {
    switch (category) {
      case 'PLASTIC': return 'bg-blue-500/20 text-blue-400';
      case 'PAPER': return 'bg-yellow-500/20 text-yellow-400';
      case 'ORGANIC': return 'bg-green-500/20 text-green-400';
      case 'GLASS': return 'bg-purple-500/20 text-purple-400';
      case 'METAL': return 'bg-orange-500/20 text-orange-400';
      case 'OTHER': return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getCategoryLabel = (category: ItemCategory) => {
    switch (category) {
      case 'PLASTIC': return 'Plastik';
      case 'PAPER': return 'Kağıt';
      case 'ORGANIC': return 'Organik';
      case 'GLASS': return 'Cam';
      case 'METAL': return 'Metal';
      case 'OTHER': return 'Diğer';
    }
  };

  const getStrokeColor = (status: ContainerStatus) => {
    switch (status) {
      case 'CRITICAL': return 'text-rose-500';
      case 'WARNING': return 'text-amber-500';
      case 'NORMAL': return 'text-emerald-500';
      case 'EMPTY': return 'text-teal-500';
    }
  };

  const fillRate = container.ai_analysis.calculated_fill_rate;
  const status = container.ai_analysis.status;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fillRate / 100) * circumference;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
        onClick={() => dispatch(selectContainer(null))}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#06100c]/95 backdrop-blur-xl border-l border-emerald-800/30 shadow-2xl z-[60] flex flex-col animate-[slideIn_0.3s_ease-out]">

        {/* Header */}
        <div className="p-6 border-b border-emerald-800/30 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{container.code}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>
            <p className="text-emerald-200 text-sm">{container.name}</p>
            <p className="text-emerald-400/50 text-xs mt-1">{container.district} • {container.lat.toFixed(4)}, {container.lng.toFixed(4)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-emerald-400/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              title="Konteyneri Sil"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => dispatch(selectContainer(null))}
              className="p-2 text-emerald-400/60 hover:text-white hover:bg-emerald-800/50 rounded-full transition-colors"
              title="Kapat"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Dimensions */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400/60 mb-3 uppercase tracking-wider">Fiziksel Özellikler</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/20">
                <p className="text-[10px] text-emerald-400/50 mb-1">Boyutlar (G × Y × D)</p>
                <p className="text-white font-medium text-sm">{container.dimensions.width} × {container.dimensions.height} × {container.dimensions.depth} cm</p>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/20">
                <p className="text-[10px] text-emerald-400/50 mb-1">Max Hacim</p>
                <p className="text-white font-medium text-sm">{(container.dimensions.max_volume_cm3 / 1000000).toFixed(2)} m³</p>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/20">
                <p className="text-[10px] text-emerald-400/50 mb-1">Max Ağırlık</p>
                <p className="text-white font-medium text-sm">{container.dimensions.max_weight_kg} kg</p>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/20">
                <p className="text-[10px] text-emerald-400/50 mb-1">Mevcut Ağırlık</p>
                <p className="text-white font-medium text-sm">{container.ai_analysis.current_weight_kg} kg</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400/60 mb-3 uppercase tracking-wider">AI Analiz Sonuçları</h3>
            <div className="bg-emerald-950/40 p-5 rounded-xl border border-emerald-800/20 flex items-center gap-6">

              {/* Circular Progress */}
              <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
                <svg className="transform -rotate-90 w-[100px] h-[100px]">
                  <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-900/50" />
                  <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${getStrokeColor(status)} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-white">%{fillRate}</span>
                  <span className="text-[10px] text-emerald-400/50">Doluluk</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-emerald-400/50">Tahmini Dolma</span>
                  <span className="text-xs text-white font-medium">{container.ai_analysis.estimated_full_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-emerald-400/50">İstif Verimi</span>
                  <span className="text-xs text-white font-medium">%{container.ai_analysis.packing_efficiency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-emerald-400/50">Son Tarama</span>
                  <span className="text-xs text-emerald-200">{container.ai_analysis.last_ai_scan}</span>
                </div>
              </div>
            </div>

            {/* Sadece Rastgele Çöp Ekle Butonu Kaldı */}
            <button
              onClick={handleAddTrash}
              disabled={isAddingTrash}
              className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-sm"
            >
              {isAddingTrash ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Çöp Ekleniyor...
                 </>
              ) : (
                 <>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                   Rastgele Çöp Ekle
                 </>
              )}
            </button>
          </div>

          {/* Detected Items */}
          {container.items.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-emerald-400/60 mb-3 uppercase tracking-wider">
                Tespit Edilen Nesneler ({container.items.length})
              </h3>
              <div className="space-y-2">
                {container.items.map(item => (
                  <div key={item.id} className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium text-sm">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-300/60">
                      <span>{item.width}×{item.height}×{item.depth} cm</span>
                      <span>{item.weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-emerald-400/50">
                      <span>Güven: %{Math.round(item.confidence * 100)}</span>
                      <span>{item.detected_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <ContainerFullModal
        isOpen={isFullModalOpen}
        onClose={() => setIsFullModalOpen(false)}
        containerCode={container.code}
      />
    </>
  );
};

export default ContainerDetail;
