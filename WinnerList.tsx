
import React, { useState } from 'react';
import { Winner } from '../types';

interface WinnerListProps {
  winners: Winner[];
}

const WinnerList: React.FC<WinnerListProps> = ({ winners }) => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = (name: string, id: string) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopyStatus(id);
      setTimeout(() => setCopyStatus(null), 2000);
    }).catch(err => {
      console.error('無法複製姓名: ', err);
    });
  };

  if (winners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-30">
        <svg className="w-20 h-20 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
        <div className="text-2xl font-bold italic">目前尚無中獎記錄</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {winners.map((winner, index) => {
        const itemId = `${winner.id}-${winner.timestamp}`;
        const isNewest = index === 0; // 最新的一個排在最前面

        return (
          <div 
            key={itemId} 
            className={`
              relative flex items-center justify-between p-6 
              bg-gradient-to-br from-white/10 to-white/5 
              rounded-3xl border-2 transition-all group overflow-hidden
              ${isNewest 
                ? 'animate-winner-new border-yellow-400 bg-yellow-500/10 scale-105' 
                : 'border-yellow-600/20 hover:border-yellow-500/50'
              }
            `}
          >
            {isNewest && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-red-900 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg animate-pulse">
                    NEWEST
                </div>
            )}

            <div className="flex items-center gap-6">
              {/* 序號徽章 */}
              <div className={`
                w-12 h-12 flex items-center justify-center rounded-full font-black text-xl shadow-lg shrink-0
                ${isNewest ? 'bg-yellow-400 text-red-950 scale-110' : 'bg-red-800 text-yellow-500 border border-yellow-600/30'}
              `}>
                {winners.length - index}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className={`font-black text-3xl ${isNewest ? 'text-white' : 'text-gray-200'}`}>
                    {winner.name}
                  </span>
                  <button
                    onClick={() => handleCopy(winner.name, itemId)}
                    className={`p-1.5 rounded-lg transition-all ${
                      copyStatus === itemId 
                        ? 'bg-green-500 text-white' 
                        : 'text-gray-500 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {copyStatus === itemId ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                  </button>
                </div>
                <div className="text-yellow-500/60 font-black text-sm uppercase tracking-widest mt-1">
                   {winner.prizeName}
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
               <span className="text-white/20 text-xs font-mono">
                  {new Date(winner.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </span>
               <div className="w-8 h-1 bg-yellow-500/20 rounded-full"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WinnerList;
