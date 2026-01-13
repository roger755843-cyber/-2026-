import React, { useState } from 'react';
import { PrizeTier } from '../types';

interface PrizeManagerProps {
  prizes: PrizeTier[];
  onUpdate: (prizes: PrizeTier[]) => void;
}

const PrizeManager: React.FC<PrizeManagerProps> = ({ prizes, onUpdate }) => {
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState(1);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newPrize: PrizeTier = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      count: newCount
    };
    onUpdate([...prizes, newPrize]);
    setNewName('');
    setNewCount(1);
  };

  const handleDelete = (id: string) => {
    onUpdate(prizes.filter(p => p.id !== id));
  };

  return (
    <div className="bg-black/20 p-6 rounded-2xl border border-yellow-600/10">
      <h4 className="text-xl font-bold text-yellow-500 mb-4 flex items-center justify-between">
        <span>獎項設置 (獎名與名額)</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        <div className="md:col-span-7">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例如：頭獎、二獎..."
            className="w-full bg-white/10 border border-yellow-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
          />
        </div>
        <div className="md:col-span-3">
          <input
            type="number"
            min="1"
            value={newCount}
            onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
            placeholder="名額"
            className="w-full bg-white/10 border border-yellow-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
          />
        </div>
        <div className="md:col-span-2">
          <button
            onClick={handleAdd}
            className="w-full h-full bg-yellow-600 hover:bg-yellow-500 text-red-950 font-bold rounded-xl transition-colors shadow-lg"
          >
            新增
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {prizes.length === 0 ? (
          <p className="text-gray-500 italic text-center py-2">尚未設置獎項...</p>
        ) : (
          prizes.map((prize) => (
            <div 
              key={prize.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                prize.count <= 0 
                  ? 'bg-black/40 border-gray-800 opacity-50' 
                  : 'bg-white/5 border-white/5 hover:border-yellow-500/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className={`font-bold ${prize.count <= 0 ? 'text-gray-500 line-through' : 'text-yellow-500'}`}>
                    {prize.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    剩餘名額：{prize.count} 位
                  </span>
                </div>
                {prize.count <= 0 && (
                  <span className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    已完抽
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleDelete(prize.id)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PrizeManager;