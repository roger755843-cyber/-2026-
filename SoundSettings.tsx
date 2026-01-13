
import React from 'react';
import { AudioSettings } from '../types';

interface SoundSettingsProps {
  settings: AudioSettings;
  onChange: (s: AudioSettings) => void;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-yellow-600/20">
      <button 
        onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
        className={`p-1 transition-colors ${settings.enabled ? 'text-yellow-500' : 'text-gray-500'}`}
        title={settings.enabled ? '靜音' : '開啟音效'}
      >
        {settings.enabled ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 18.11V15.5c2.04-.6 3.5-2.48 3.5-4.69 0-2.21-1.46-4.09-3.5-4.69V3.42c3.13.67 5.5 3.45 5.5 6.77s-2.37 6.1-5.5 6.77M3 9h4l5-5v16l-5-5H3V9m11 2.5c0-.94-.54-1.76-1.33-2.16v4.32c.79-.4 1.33-1.22 1.33-2.16z"/></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        )}
      </button>
      <input 
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={settings.volume}
        onChange={(e) => onChange({ ...settings, volume: parseFloat(e.target.value) })}
        className="w-20 accent-yellow-500 h-1"
        disabled={!settings.enabled}
      />
    </div>
  );
};

export default SoundSettings;
