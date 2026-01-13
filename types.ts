
export interface Participant {
  id: string;
  name: string;
}

export interface Winner {
  id: string;
  name: string;
  prizeName: string;
  timestamp: number;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
}

export interface PrizeTier {
  id: string;
  name: string;
  count: number;
}

export type ViewMode = 'LOTTERY' | 'INPUT' | 'MANAGEMENT' | 'REGISTRATION';
