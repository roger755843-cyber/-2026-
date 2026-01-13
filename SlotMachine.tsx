import React, { useState, useEffect, useRef } from 'react';
import { Participant } from '../types';

interface SlotMachineProps {
  isRolling: boolean;
  participants: Participant[];
  onStart: () => void;
  onStop: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ isRolling, participants, onStart, onStop }) => {
  const [displayParticipants, setDisplayParticipants] = useState<Participant[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 縮小高度以適應更多螢幕
  const ITEM_HEIGHT = 160; 

  useEffect(() => {
    if (participants.length > 0) {
      const pool = [];
      for (let i = 0; i < 25; i++) {
        pool.push(...participants.sort(() => Math.random() - 0.5));
      }
      setDisplayParticipants(pool);
    }
  }, [participants]);

  const getRollingTransform = () => {
    if (!isRolling) return 'translateY(0px)';
    const travelDistance = (displayParticipants.length - 2) * ITEM_HEIGHT;
    return `translateY(-${travelDistance}px)`;
  };

  return (
    <div className="w-full max-h-full flex flex-col items-center justify-center overflow-hidden">
      {/* 拉霸視窗 - 使用 max-h 確保不超出螢幕 */}
      <div className="relative w-full max-w-5xl h-[360px] bg-black border-[10px] border-yellow-600 rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.4)]">
        
        {/* 中獎標示區 */}
        <div className="absolute top-1/2 left-0 right-0 h-[160px] -translate-y-1/2 bg-yellow-500/5 z-10 border-y-2 border-yellow-500/20 pointer-events-none"></div>

        {/* 名字滾動區 */}
        <div className="slot-mask h-full w-full">
          <div 
            ref={containerRef}
            className="flex flex-col items-center pt-[100px]"
            style={{
              transform: getRollingTransform(),
              transition: isRolling 
                ? `transform 15s linear` 
                : `transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
              willChange: 'transform'
            }}
          >
            {displayParticipants.map((p, i) => (
              <div 
                key={`${p.id}-${i}`} 
                className="h-[160px] flex items-center justify-center shrink-0 w-full"
              >
                <span className={`
                  font-black tracking-widest transition-all duration-300
                  ${isRolling 
                    ? 'text-white/40 blur-[2px] text-7xl md:text-8xl' 
                    : 'text-white text-8xl md:text-[10rem] drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]'
                  }
                `}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none z-30"></div>
      </div>

      {/* 按鈕區域 - 縮小比例 */}
      <div className="mt-8 relative group">
        <div className={`absolute -inset-10 rounded-full blur-[60px] transition-all duration-1000 opacity-30 ${isRolling ? 'bg-red-600' : 'bg-yellow-400'} animate-pulse`}></div>
        <button
          onClick={isRolling ? onStop : onStart}
          className={`
            relative 
            flex items-center justify-center gap-8
            text-6xl md:text-8xl font-black 
            py-8 md:py-12 px-24 md:px-40 
            rounded-full shadow-2xl transition-all duration-300 transform 
            hover:-translate-y-2 active:translate-y-2 border-b-[12px]
            ${isRolling 
              ? 'bg-gradient-to-b from-red-500 to-red-800 border-red-950 text-white' 
              : 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-800 text-red-950'
            }
          `}
        >
          <span className="relative z-10 tracking-[0.2em]">{isRolling ? '停' : '抽'}</span>
          {!isRolling && (
            <svg className="w-16 h-16 md:w-24 md:h-24 relative z-10 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default SlotMachine;
