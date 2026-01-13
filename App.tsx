import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, Winner, AudioSettings, ViewMode, PrizeTier } from './types';
import { audioService } from './services/AudioService';
import SlotMachine from './components/SlotMachine';
import WinnerList from './components/WinnerList';
import InputPanel from './components/InputPanel';
import SoundSettings from './components/SoundSettings';
import EmployeeJoinView from './components/EmployeeJoinView';
import PrizeManager from './components/PrizeManager';

const LOCAL_STORAGE_KEY = 'weiya_lottery_v1';
const SYNC_CHANNEL_NAME = 'lottery_sync_channel';

const isMobileJoinMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'join';
};

const App: React.FC = () => {
  const [isStandaloneJoin] = useState(isMobileJoinMode());
  const [viewMode, setViewMode] = useState<ViewMode>('LOTTERY');
  
  const syncChannel = useMemo(() => {
    try {
      return new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch (e) {
      return null;
    }
  }, []);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [prizes, setPrizes] = useState<PrizeTier[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({ enabled: true, volume: 0.5 });
  const [isRolling, setIsRolling] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [prizeName, setPrizeName] = useState('感恩餐會特等獎');
  
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(isStandaloneJoin);
  const [showWinnerList, setShowWinnerList] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const rollingIntervalRef = useRef<number | null>(null);

  const loadData = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setParticipants(data.participants || []);
        setWinners(data.winners || []);
        setPrizes(data.prizes || []);
        setAudioSettings(data.audioSettings || { enabled: true, volume: 0.5 });
        // 如果 localStorage 沒有 prizeName，則預設選取第一個有效獎項
        if (!data.prizeName && data.prizes?.length > 0) {
           setPrizeName(data.prizes[0].name);
        } else {
           setPrizeName(data.prizeName || '感恩餐會特等獎');
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    loadData();
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data.type === 'SYNC_DATA') loadData();
      };
    }
    const timer = setInterval(loadData, 3000);
    return () => {
      clearInterval(timer);
      if (syncChannel) syncChannel.close();
    };
  }, [syncChannel, loadData]);

  const saveData = useCallback((updates: any) => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const currentData = saved ? JSON.parse(saved) : {};
    const newData = { ...currentData, ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    if (syncChannel) syncChannel.postMessage({ type: 'SYNC_DATA' });
  }, [syncChannel]);

  const handleAddParticipant = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let currentP: Participant[] = [];
    if (saved) {
      try {
        currentP = JSON.parse(saved).participants || [];
      } catch(e) {}
    }

    if (currentP.some(p => p.name === trimmed)) return false;
    
    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: trimmed
    };
    
    const nextState = [...currentP, newParticipant];
    setParticipants(nextState);
    saveData({ participants: nextState });
    return true;
  }, [saveData]);

  useEffect(() => {
    audioService.setVolume(audioSettings.enabled ? audioSettings.volume : 0);
  }, [audioSettings]);

  const unlockAudio = async () => {
    await audioService.unlock();
    setIsAudioUnlocked(true);
  };

  const startLottery = useCallback(() => {
    if (isRolling || participants.length === 0 || prizes.length === 0) return;
    // 檢查目前獎項是否還有名額
    const currentPrize = prizes.find(p => p.name === prizeName);
    if (!currentPrize || currentPrize.count <= 0) {
      alert("目前獎項已無名額，請切換至其他獎項。");
      return;
    }

    setIsRolling(true);
    setCurrentWinner(null);
    if (audioSettings.enabled) {
      rollingIntervalRef.current = window.setInterval(() => audioService.playRolling(), 100);
    }
  }, [isRolling, participants.length, prizes, prizeName, audioSettings.enabled]);

  const stopLottery = useCallback(() => {
    if (!isRolling) return;
    if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
    setIsRolling(false);
    
    const randomIndex = Math.floor(Math.random() * participants.length);
    const chosen = participants[randomIndex];
    const newWinner: Winner = { ...chosen, prizeName, timestamp: Date.now() };

    const nextWinners = [newWinner, ...winners];
    const nextParticipants = participants.filter(p => p.id !== chosen.id);

    setWinners(nextWinners);
    setParticipants(nextParticipants);
    setCurrentWinner(newWinner);
    saveData({ participants: nextParticipants, winners: nextWinners });

    if (audioSettings.enabled) {
      audioService.playStop();
      setTimeout(() => audioService.playWin(), 300);
    }
  }, [isRolling, participants, winners, prizeName, audioSettings.enabled, saveData]);

  const handleConfirmWinner = useCallback(() => {
    setCurrentWinner(null);
    
    const currentIndex = prizes.findIndex(p => p.name === prizeName);
    if (currentIndex === -1) return;

    // 1. 更新名額（不從清單刪除，只扣數字）
    const updatedPrizes = prizes.map((p, idx) => 
      idx === currentIndex ? { ...p, count: Math.max(0, p.count - 1) } : p
    );

    // 2. 決定下一個獎項
    let nextPrizeName = prizeName;
    const currentPrizeAfterUpdate = updatedPrizes[currentIndex];

    if (currentPrizeAfterUpdate.count <= 0) {
      // 尋找下一個還有名額的獎項
      // 先從當前位置往後找
      let nextAvailable = updatedPrizes.find((p, idx) => idx > currentIndex && p.count > 0);
      
      // 如果後面沒了，從頭開始找
      if (!nextAvailable) {
        nextAvailable = updatedPrizes.find((p) => p.count > 0);
      }

      if (nextAvailable) {
        nextPrizeName = nextAvailable.name;
      } else {
        nextPrizeName = "所有獎項已全數抽完";
      }
    }

    // 3. 儲存
    setPrizes(updatedPrizes);
    setPrizeName(nextPrizeName);
    saveData({ 
      prizes: updatedPrizes, 
      prizeName: nextPrizeName 
    });
  }, [prizes, prizeName, saveData]);

  const joinUrl = useMemo(() => {
    const url = new URL(window.location.href.replace(/^blob:/, ''));
    url.searchParams.set('mode', 'join');
    return url.toString();
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}`;

  // 僅限還有名額的獎項出現在投影選單中
  const activePrizes = useMemo(() => prizes.filter(p => p.count > 0), [prizes]);

  if (isStandaloneJoin) {
    return <EmployeeJoinView onJoin={handleAddParticipant} />;
  }

  if (!isAudioUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-yellow-400 p-8 text-center bg-red-950">
        <h1 className="text-6xl md:text-8xl font-black mb-8 drop-shadow-lg">金樹集團<br/>2026 感恩餐會</h1>
        <button onClick={unlockAudio} className="bg-yellow-500 hover:bg-yellow-400 text-red-900 text-4xl md:text-5xl font-bold py-8 px-16 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95">進入抽獎系統</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-red-950 overflow-hidden">
      <nav className="flex bg-black/40 border-b border-yellow-600/20 z-50 shrink-0">
        <button onClick={() => setViewMode('LOTTERY')} className={`px-8 py-4 font-black text-lg transition-all ${viewMode === 'LOTTERY' ? 'text-yellow-400 border-b-4 border-yellow-400 bg-yellow-400/5' : 'text-gray-500 hover:text-gray-300'}`}>投影抽獎</button>
        <button onClick={() => setViewMode('INPUT')} className={`px-8 py-4 font-black text-lg transition-all ${viewMode === 'INPUT' ? 'text-yellow-400 border-b-4 border-yellow-400 bg-yellow-400/5' : 'text-gray-500 hover:text-gray-300'}`}>名單管理</button>
        <button onClick={() => setViewMode('MANAGEMENT')} className={`px-8 py-4 font-black text-lg transition-all ${viewMode === 'MANAGEMENT' ? 'text-yellow-400 border-b-4 border-yellow-400 bg-yellow-400/5' : 'text-gray-500 hover:text-gray-300'}`}>抽獎管理</button>
        <button onClick={() => setViewMode('REGISTRATION')} className={`px-8 py-4 font-black text-lg transition-all ${viewMode === 'REGISTRATION' ? 'text-yellow-400 border-b-4 border-yellow-400 bg-yellow-400/5' : 'text-gray-500 hover:text-gray-300'}`}>登記頁預覽</button>
        <div className="flex-grow"></div>
        <div className="flex items-center gap-4 px-6">
            <SoundSettings settings={audioSettings} onChange={(s) => {setAudioSettings(s); saveData({ audioSettings: s });}} />
        </div>
      </nav>

      <main className="flex-grow relative overflow-hidden">
        {viewMode === 'LOTTERY' && (
          <div className="h-full flex flex-col items-center justify-between p-6 md:p-10 animate-fade-in overflow-hidden">
            <header className="text-center w-full shrink-0">
              <h2 className="text-4xl md:text-7xl font-black text-yellow-500 mb-6 drop-shadow-2xl tracking-tighter leading-none">2026 金樹感恩餐會</h2>
              <div className="inline-flex items-center gap-6 bg-black/60 px-8 py-3 rounded-full border border-yellow-600/30">
                <span className="text-gray-400 text-xl font-bold">目前獎項</span>
                {activePrizes.length > 0 ? (
                  <select 
                    value={prizeName} 
                    onChange={(e) => {setPrizeName(e.target.value); saveData({ prizeName: e.target.value });}} 
                    className="bg-transparent border-b-2 border-yellow-500 text-3xl md:text-5xl font-black text-yellow-400 focus:outline-none px-2 appearance-none cursor-pointer"
                  >
                    {activePrizes.map(p => <option key={p.id} value={p.name} className="bg-red-950 text-yellow-500">{p.name} (剩餘 {p.count} 名)</option>)}
                  </select>
                ) : <span className="text-red-500 text-2xl font-black">{prizeName}</span>}
              </div>
            </header>

            <div className="flex-grow w-full flex items-center justify-center overflow-hidden py-4">
              {currentWinner ? (
                <div className="text-center animate-winner-new max-w-full">
                  <p className="text-3xl text-gray-300 mb-4 font-bold tracking-[0.4em]">恭喜幸運得主</p>
                  <h3 className="text-[12rem] md:text-[18rem] font-black text-white mb-8 animate-glow-pulse leading-none truncate px-4">{currentWinner.name}</h3>
                  <button onClick={handleConfirmWinner} className="bg-yellow-500 hover:bg-yellow-400 text-red-900 text-4xl md:text-6xl font-black py-8 px-24 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">確定領取</button>
                </div>
              ) : <SlotMachine isRolling={isRolling} participants={participants} onStart={startLottery} onStop={stopLottery} />}
            </div>

            <footer className="w-full max-w-6xl shrink-0">
              <button onClick={() => setShowWinnerList(!showWinnerList)} className="text-yellow-500/50 text-xl font-black mb-2 flex items-center gap-2 hover:text-yellow-400 transition-colors">
                {showWinnerList ? '▼ 隱藏紀錄' : '▲ 顯示紀錄'} <span className="bg-yellow-600/20 px-2 py-0.5 rounded text-sm">{winners.length}</span>
              </button>
              {showWinnerList && (
                <div className="max-h-40 overflow-y-auto bg-black/50 rounded-2xl p-4 border border-yellow-900/30 custom-scrollbar">
                  <WinnerList winners={winners} />
                </div>
              )}
            </footer>
          </div>
        )}

        {viewMode === 'INPUT' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-4xl mx-auto space-y-8 bg-black/20 p-10 rounded-[2.5rem] border border-white/5">
              <InputPanel onAdd={handleAddParticipant} count={participants.length} />
              
              <div className="space-y-4">
                <h4 className="text-xl font-black text-yellow-500/80">待抽名單 ({participants.length})</h4>
                <div className="h-[400px] overflow-y-auto bg-black/40 rounded-2xl p-6 flex flex-wrap gap-2 content-start border border-white/5 custom-scrollbar">
                  {participants.length === 0 ? (
                    <div className="w-full text-center text-gray-500 italic py-12">目前名單內無人</div>
                  ) : (
                    participants.map(p => (
                      <span key={p.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white font-bold hover:bg-red-800/30 transition-colors cursor-default">
                        {p.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'MANAGEMENT' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-4xl mx-auto space-y-8 bg-black/20 p-10 rounded-[2.5rem] border border-white/5">
              <h3 className="text-3xl font-black text-yellow-500 flex items-center gap-4">
                <span className="w-1.5 h-8 bg-yellow-500 rounded-full"></span>
                抽獎管理設定
              </h3>
              
              <PrizeManager prizes={prizes} onUpdate={(p) => {setPrizes(p); saveData({ prizes: p });}} />

              <div className="space-y-4">
                <h4 className="text-xl font-black text-green-500/80">中獎紀錄管理 ({winners.length})</h4>
                <div className="h-64 overflow-y-auto bg-black/40 rounded-2xl p-4 border border-white/5 custom-scrollbar">
                  <WinnerList winners={winners} />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <button onClick={() => {if(confirm("確定要重設所有數據（含名單、中獎紀錄與獎項）嗎？")) {localStorage.clear(); window.location.reload();}}} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-6 py-3 rounded-xl text-sm font-bold transition-all border border-red-900/50">⚠️ 完整重設系統</button>
                <div className="text-gray-600 text-xs">System Version: v2026.1.3</div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'REGISTRATION' && (
          <div className="h-full w-full overflow-hidden">
             <EmployeeJoinView onJoin={handleAddParticipant} />
          </div>
        )}
      </main>

      {showQR && viewMode === 'LOTTERY' && (
        <div className="fixed bottom-32 left-8 z-[100] w-72 bg-white rounded-[2rem] p-6 shadow-2xl animate-winner-new text-center border-4 border-yellow-500">
           <h4 className="text-[#b91c1c] font-black text-lg mb-4">掃碼登記抽獎</h4>
           <div className="bg-gray-50 p-2 rounded-xl mb-4">
             <img src={qrImageUrl} alt="QR Code" className="w-full h-auto" />
           </div>
           <button onClick={() => setShowQR(false)} className="w-full bg-[#b91c1c] text-white py-3 rounded-lg font-bold">關閉</button>
        </div>
      )}

      {viewMode === 'LOTTERY' && (
        <button onClick={() => setShowQR(!showQR)} className="fixed bottom-8 left-8 bg-yellow-500 hover:bg-yellow-400 p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 group z-[101]">
           <img src={qrImageUrl} alt="QR" className="w-10 h-10 bg-white p-1 rounded-md" />
        </button>
      )}
    </div>
  );
};

export default App;