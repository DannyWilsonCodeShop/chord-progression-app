'use client';

import { useState, useEffect } from 'react';
import * as Tone from 'tone';

interface EffectsPanelProps {
  isSubscribed: boolean;
}

export default function EffectsPanel({ isSubscribed }: EffectsPanelProps) {
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbDecay, setReverbDecay] = useState(2.5);
  const [reverbWet, setReverbWet] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(-6);
  const [chordVolume, setChordVolume] = useState(0);
  const [bassVolume, setBassVolume] = useState(0);

  useEffect(() => {
    // Set master volume
    Tone.getDestination().volume.value = masterVolume;
  }, [masterVolume]);

  const toggleReverb = async () => {
    if (!isSubscribed) {
      alert('Reverb is a Pro feature! Subscribe for $3.99/month or use code STUDENT2024');
      return;
    }

    if (!reverbEnabled) {
      // Create and connect reverb
      const reverb = new Tone.Reverb(reverbDecay);
      reverb.wet.value = reverbWet;
      await reverb.generate();
      Tone.getDestination().chain(reverb, Tone.getDestination());
      setReverbEnabled(true);
    } else {
      // Disconnect reverb
      // Note: In production, we'd track the reverb instance to dispose it
      setReverbEnabled(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-cyan-400 font-mono tracking-wider">
        MIXER & EFFECTS
      </h3>

      <div className="space-y-4">
        {/* Master Volume */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">Master Volume</label>
            <span className="text-cyan-400 font-mono font-bold text-sm">{masterVolume} dB</span>
          </div>
          <input
            type="range"
            min="-40"
            max="6"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Chord Volume */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">Chord Volume</label>
            <span className="text-cyan-400 font-mono font-bold text-sm">
              {chordVolume > 0 ? '+' : ''}{chordVolume} dB
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={chordVolume}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setChordVolume(val);
              // This would be applied to chord players/elements
              // For now, it's a visual indicator
            }}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
        </div>

        {/* Bass Volume */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">Bass Volume</label>
            <span className="text-cyan-400 font-mono font-bold text-sm">
              {bassVolume > 0 ? '+' : ''}{bassVolume} dB
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={bassVolume}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setBassVolume(val);
              // This would be applied to bass players/elements
            }}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>

        {/* Reverb Section */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-300 text-sm font-mono">
              Reverb {!isSubscribed && '🔒'}
            </label>
            <button
              onClick={toggleReverb}
              className={`px-4 py-1 rounded font-mono text-xs font-bold transition-colors ${
                reverbEnabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : isSubscribed
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {reverbEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {reverbEnabled && (
            <div className="space-y-3 pl-2">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-gray-400 text-xs font-mono">Decay</label>
                  <span className="text-purple-400 font-mono text-xs">{reverbDecay}s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={reverbDecay}
                  onChange={(e) => setReverbDecay(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-gray-400 text-xs font-mono">Mix</label>
                  <span className="text-purple-400 font-mono text-xs">{Math.round(reverbWet * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={reverbWet}
                  onChange={(e) => setReverbWet(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

