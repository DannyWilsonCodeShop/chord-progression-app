'use client';

import { KeySignature, ChordProgression } from '@/types/chords';

interface ChordSelectorProps {
  selectedKey: KeySignature;
  selectedProgression: ChordProgression;
  onKeyChange: (key: KeySignature) => void;
  onProgressionChange: (progression: ChordProgression) => void;
}

const keys: KeySignature[] = ['C', 'G', 'D', 'A', 'E'];

const progressions = [
  {
    value: 'I-V-vi-IV' as ChordProgression,
    name: 'I-V-vi-IV',
    description: 'Classic pop progression (C-G-Am-F)',
    examples: ['Let It Be', 'No Woman No Cry', 'Don\'t Stop Believin\''],
  },
  {
    value: 'vi-IV-I-V' as ChordProgression,
    name: 'vi-IV-I-V',
    description: 'Emotional progression (Am-F-C-G)',
    examples: ['Someone Like You', 'Complicated', 'When I Was Your Man'],
  },
  {
    value: 'I-vi-IV-V' as ChordProgression,
    name: 'I-vi-IV-V',
    description: 'Doo-wop progression (C-Am-F-G)',
    examples: ['Earth Angel', 'Stand By Me', 'All I Have to Do Is Dream'],
  },
  {
    value: 'ii-V-I' as ChordProgression,
    name: 'ii-V-I',
    description: 'Jazz progression (Dm-G-C)',
    examples: ['Autumn Leaves', 'All The Things You Are', 'Blue Moon'],
  },
  {
    value: 'I-IV-V-I' as ChordProgression,
    name: 'I-IV-V-I',
    description: 'Blues progression (C-F-G-C)',
    examples: ['Sweet Home Chicago', 'Cross Road Blues', 'Stormy Monday'],
  },
];

export default function ChordSelector({
  selectedKey,
  selectedProgression,
  onKeyChange,
  onProgressionChange,
}: ChordSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Chord Settings</h3>
      
      {/* Key Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Key Signature
        </label>
        <div className="grid grid-cols-5 gap-2">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => onKeyChange(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Progression Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Chord Progression
        </label>
        <div className="space-y-2">
          {progressions.map((progression) => (
            <button
              key={progression.value}
              onClick={() => onProgressionChange(progression.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                selectedProgression === progression.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">
                    {progression.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {progression.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Examples: {progression.examples.join(', ')}
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedProgression === progression.value
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
