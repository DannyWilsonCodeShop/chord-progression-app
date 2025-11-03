'use client';

import { KeySignature, ChordProgression } from '@/types/chords';

interface ChordSelectorProps {
  selectedKey: KeySignature;
  selectedProgression: ChordProgression;
  onKeyChange: (key: KeySignature) => void;
  onProgressionChange: (progression: ChordProgression) => void;
  isSubscribed?: boolean;
}

const keys: KeySignature[] = ['C', 'G', 'D', 'A', 'E'];

const progressions = [
  {
    value: 'I-ii-iii-IV-V-vi-vii°-I' as ChordProgression,
    name: 'Full Major Scale',
    description: 'Complete diatonic scale (C-Dm-Em-F-G-Am-Bdim-C)',
    examples: ['All diatonic chords mapped to keyboard: A S D F J K L ;'],
    locked: false,
  },
  {
    value: 'chromatic' as ChordProgression,
    name: 'Chromatic (All Chord Types) 🔒',
    description: 'All 12 chromatic notes with Aug/Major/Minor/Dim - 48 chords total',
    examples: ['Premium Feature - Subscribe to unlock'],
    locked: true,
  },
  {
    value: 'I-V-vi-IV' as ChordProgression,
    name: 'I-V-vi-IV',
    description: 'Classic pop progression (C-G-Am-F)',
    examples: ['Let It Be', 'No Woman No Cry', 'Don\'t Stop Believin\''],
    locked: false,
  },
  {
    value: 'vi-IV-I-V' as ChordProgression,
    name: 'vi-IV-I-V',
    description: 'Emotional progression (Am-F-C-G)',
    examples: ['Someone Like You', 'Complicated', 'When I Was Your Man'],
    locked: false,
  },
  {
    value: 'I-vi-IV-V' as ChordProgression,
    name: 'I-vi-IV-V',
    description: 'Doo-wop progression (C-Am-F-G)',
    examples: ['Earth Angel', 'Stand By Me', 'All I Have to Do Is Dream'],
    locked: false,
  },
  {
    value: 'ii-V-I' as ChordProgression,
    name: 'ii-V-I',
    description: 'Jazz progression (Dm-G-C)',
    examples: ['Autumn Leaves', 'All The Things You Are', 'Blue Moon'],
    locked: false,
  },
  {
    value: 'I-IV-V-I' as ChordProgression,
    name: 'I-IV-V-I',
    description: 'Blues progression (C-F-G-C)',
    examples: ['Sweet Home Chicago', 'Cross Road Blues', 'Stormy Monday'],
    locked: false,
  },
];

export default function ChordSelector({
  selectedKey,
  selectedProgression,
  onKeyChange,
  onProgressionChange,
  isSubscribed = false,
}: ChordSelectorProps) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-2 border-gray-700">
      <h3 className="text-xl font-semibold mb-6 text-green-400 font-mono tracking-wider">CHORD SETTINGS</h3>
      
      {/* Key Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3 font-mono">
          SELECT KEY SIGNATURE
        </label>
        <div className="grid grid-cols-5 gap-2">
          {keys.map((key) => {
            const isLocked = key !== 'C' && !isSubscribed;
            return (
              <button
                key={key}
                onClick={() => {
                  if (isLocked) {
                    alert(`Subscribe to unlock ${key} key signature!`);
                  } else {
                    onKeyChange(key);
                  }
                }}
                disabled={isLocked}
                className={`px-4 py-2 rounded-lg font-medium transition-colors font-mono relative ${
                  selectedKey === key
                    ? 'bg-green-600 text-black'
                    : isLocked
                    ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {key}
                {isLocked && <span className="ml-1 text-xs">🔒</span>}
              </button>
            );
          })}
        </div>
        {!isSubscribed && (
          <p className="text-xs text-yellow-400 mt-2 font-mono">
            🔒 Subscribe to unlock other key signatures
          </p>
        )}
      </div>

      {/* Progression Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3 font-mono">
          SELECT CHORD PROGRESSION
        </label>
        <div className="space-y-2">
          {progressions.map((progression) => {
            const isLocked = progression.locked && !isSubscribed;
            return (
              <button
                key={progression.value}
                onClick={() => {
                  if (isLocked) {
                    alert('Subscribe to unlock Chromatic progression with all 48 chord types!');
                  } else {
                    onProgressionChange(progression.value);
                  }
                }}
                disabled={isLocked}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedProgression === progression.value
                    ? 'border-green-500 bg-green-900'
                    : isLocked
                    ? 'border-gray-700 bg-gray-900 opacity-60 cursor-not-allowed'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white font-mono">
                      {progression.name}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {progression.description}
                    </div>
                    <div className={`text-xs mt-2 ${isLocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {isLocked ? '🔒 ' : 'Examples: '}{progression.examples.join(', ')}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedProgression === progression.value
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
