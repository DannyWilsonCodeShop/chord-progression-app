export type KeySignature = 'C' | 'G' | 'D' | 'A' | 'E';

export type ChordProgression = 
  | 'I-V-vi-IV' 
  | 'vi-IV-I-V' 
  | 'I-vi-IV-V' 
  | 'ii-V-I' 
  | 'I-IV-V-I';

export type Instrument = 'piano' | 'guitar' | 'bass' | 'synth' | 'drums';

export interface Chord {
  name: string;
  notes: string[];
  symbol: string;
}

export interface ChordProgressionData {
  name: string;
  progression: string;
  description: string;
  commonIn: string[];
}

export interface KeyboardMapping {
  [key: string]: string; // key -> chord
}

export interface UserSettings {
  defaultKey: KeySignature;
  defaultProgression: ChordProgression;
  keyboardMapping: KeyboardMapping;
  volume: number;
  tempo: number;
}
