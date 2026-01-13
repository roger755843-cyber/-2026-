
import React, { useState } from 'react';

interface InputPanelProps {
  onAdd: (name: string) => void;
  count: number;
}

const InputPanel: React.FC<InputPanelProps> = ({ onAdd, count }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="bg-black/20 p-6 rounded-2xl border border-yellow-600/10">
      <h4 className="text-xl font-bold text-yellow-500 mb-4 flex items-center justify-between">
        <span>手動加入 / 掃碼輸入</span>
        <span className="text-sm font-normal text-gray-400">目前總數: {count}</span>
      </h4>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入員工姓名後按 Enter..."
          className="flex-grow bg-white/10 border border-yellow-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
        />
        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-500 text-red-950 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
        >
          加入名單
        </button>
      </form>
      <div className="mt-4 flex items-start gap-3 bg-red-900/30 p-3 rounded-lg border border-red-700/50">
        <div className="text-yellow-500">💡</div>
        <p className="text-sm text-gray-400">
          Tip: 可將此頁面分享給同仁，在此欄位輸入姓名後點擊加入。本系統不接受重複姓名，中獎後將自動從名單移除。
        </p>
      </div>
    </div>
  );
};

export default InputPanel;
