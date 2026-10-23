import React from 'react';

interface ContainerFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerCode: string;
}

const ContainerFullModal: React.FC<ContainerFullModalProps> = ({ isOpen, onClose, containerCode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#06100c] border border-emerald-700/20 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center animate-[scaleIn_0.3s_ease-out] overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
          <svg className="w-8 h-8 text-rose-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Konteyner Tamamen Dolu!
        </h3>
        
        <p className="text-sm text-emerald-200/80 mb-6 leading-relaxed">
          <strong className="text-rose-400 font-semibold">{containerCode}</strong> kodlu konteyner %100 doluluk oranına veya maksimum ağırlık kapasitesine ulaşmıştır. Daha fazla çöp eklenemez.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-900/60 hover:bg-emerald-800/80 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-emerald-700/30 hover:border-emerald-600/50"
        >
          Anlaşıldı
        </button>
      </div>
    </div>
  );
};

export default ContainerFullModal;
