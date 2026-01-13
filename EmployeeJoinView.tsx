import React, { useState } from 'react';

interface EmployeeJoinViewProps {
  onJoin: (name: string) => boolean | undefined;
  onBack?: () => void;
}

const EmployeeJoinView: React.FC<EmployeeJoinViewProps> = ({ onJoin, onBack }) => {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('請輸入姓名後再提交');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const success = onJoin(trimmedName);
      setIsSubmitting(false);
      
      if (success === true) {
        setJoined(true);
      } else {
        setError('此姓名已在名單中，請勿重複登記');
      }
    }, 400);
  };

  const containerStyle = "h-full w-full bg-[#fef2f2] flex flex-col items-center justify-center p-4 overflow-y-auto";

  if (joined) {
    return (
      <div className={containerStyle}>
        <div className="w-full max-w-[400px] bg-white rounded-[2rem] p-10 text-center shadow-xl border-t-8 border-[#b91c1c] animate-winner-new relative overflow-hidden">
          <div className="absolute -top-6 -right-6 text-[10rem] text-red-700/5 font-black pointer-events-none select-none">福</div>
          
          <div className="text-7xl mb-6">🧧</div>
          <h2 className="text-3xl font-black text-[#b91c1c] mb-2">登記成功</h2>
          <p className="text-gray-500 text-lg mb-8">祝您中大獎！</p>
          
          <div className="bg-red-50 p-6 rounded-2xl mb-8 border border-red-100">
            <p className="text-red-900 font-black text-3xl">{name}</p>
          </div>

          <button 
            onClick={() => { setJoined(false); setName(''); }}
            className="w-full bg-[#b91c1c] text-white font-bold py-4 rounded-xl text-xl shadow-lg active:scale-95 transition-transform"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      <div className="w-full max-w-[400px] bg-white rounded-[2rem] p-10 shadow-xl border-t-8 border-[#b91c1c] relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-[10rem] text-red-700/5 font-black pointer-events-none select-none">福</div>
        
        <header className="mb-8 text-center relative z-10">
          <h1 className="text-xl font-black text-[#b91c1c] tracking-tighter mb-1">金樹集團 2026</h1>
          <h2 className="text-lg font-bold text-[#7f1d1d]">同仁抽獎登記系統</h2>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[#7f1d1d] font-black text-sm block">員工全名</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if(error) setError('');
              }}
              placeholder="請輸入中文姓名"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-4 text-xl text-center font-bold focus:outline-none focus:border-[#b91c1c] focus:bg-white transition-all shadow-inner"
            />
            {error && <p className="text-red-600 text-sm font-bold text-center mt-2 animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-[#b91c1c] hover:bg-[#991b1b]'} text-white font-bold text-xl py-4 rounded-xl shadow-lg active:scale-95 transition-all`}
          >
            {isSubmitting ? '處理中...' : '確認登記'}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
          * 每個姓名僅限登記一次<br/>
          登記後請留意現場抽獎狀況
        </p>
      </div>

      {onBack && (
        <button 
          onClick={onBack}
          className="mt-6 text-gray-400 text-sm underline hover:text-[#b91c1c] transition-colors"
        >
          返回
        </button>
      )}
    </div>
  );
};

export default EmployeeJoinView;
