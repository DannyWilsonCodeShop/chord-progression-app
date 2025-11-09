'use client';

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface SequencerProps {
  selectedKey: string;
  selectedProgression: string;
  isSubscribed: boolean;
}

export default function Sequencer({ selectedKey, selectedProgression, isSubscribed }: SequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [pattern, setPattern] = useState<'whole' | 'half' | 'quarter'>('quarter');
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Chord progression mapping
  const getChordNotes = (key: string, progression: string): string[][] => {
    // Simple C major scale chords for demo
    const chordMaps: Record<string, string[]> = {
      'C': ['C4', 'E4', 'G4'],
      'Dm': ['D4', 'F4', 'A4'],
      'Em': ['E4', 'G4', 'B4'],
      'F': ['F4', 'A4', 'C5'],
      'G': ['G4', 'B4', 'D5'],
      'Am': ['A4', 'C5', 'E5'],
      'Bdim': ['B4', 'D5', 'F5'],
    };

    // For full major scale progression
    if (progression === 'I-ii-iii-IV-V-vi-vii°-I') {
      return [
        chordMaps['C'], chordMaps['Dm'], chordMaps['Em'], chordMaps['F'],
        chordMaps['G'], chordMaps['Am'], chordMaps['Bdim'], chordMaps['C']
      ];
    }

    // Default to I-V-vi-IV (pop progression)
    return [chordMaps['C'], chordMaps['G'], chordMaps['Am'], chordMaps['F']];
  };

  useEffect(() => {
    // Create synth for sequencer
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.8,
        release: 0.4,
      },
    }).toDestination();
    synth.volume.value = -8;
    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const startSequence = async () => {
    if (!isSubscribed) {
      alert('Sequencer is a Pro feature! Subscribe for $9.99/month or use code STUDENT2024');
      return;
    }

    await Tone.start();

    const chordNotes = getChordNotes(selectedKey, selectedProgression);
    
    // Note duration based on pattern
    const noteDuration = pattern === 'whole' ? '1n' : pattern === 'half' ? '2n' : '4n';
    
    // Create sequence
    const sequence = new Tone.Sequence(
      (time, chord) => {
        if (synthRef.current && chord) {
          synthRef.current.triggerAttackRelease(chord, noteDuration, time);
        }
      },
      chordNotes,
      noteDuration
    );

    sequenceRef.current = sequence;
    sequence.start(0);
    sequence.loop = true;
    
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopSequence = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-orange-400 font-mono tracking-wider flex items-center gap-2">
        <span>SEQUENCER</span>
        {!isSubscribed && <span className="text-xs text-yellow-400">🔒 PRO</span>}
      </h3>

      <div className="space-y-4">
        {/* BPM Control */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">Tempo (BPM)</label>
            <span className="text-orange-400 font-mono font-bold">{bpm}</span>
          </div>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            disabled={!isSubscribed}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Pattern Selection */}
        <div>
          <label className="text-gray-300 text-sm font-mono mb-2 block">Note Length</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPattern('whole')}
              disabled={!isSubscribed}
              className={`py-2 rounded font-mono text-xs font-bold transition-colors ${
                pattern === 'whole'
                  ? 'bg-orange-600 text-white'
                  : isSubscribed
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              WHOLE
            </button>
            <button
              onClick={() => setPattern('half')}
              disabled={!isSubscribed}
              className={`py-2 rounded font-mono text-xs font-bold transition-colors ${
                pattern === 'half'
                  ? 'bg-orange-600 text-white'
                  : isSubscribed
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              HALF
            </button>
            <button
              onClick={() => setPattern('quarter')}
              disabled={!isSubscribed}
              className={`py-2 rounded font-mono text-xs font-bold transition-colors ${
                pattern === 'quarter'
                  ? 'bg-orange-600 text-white'
                  : isSubscribed
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              QUARTER
            </button>
          </div>
        </div>

        {/* Play/Stop Button */}
        <button
          onClick={isPlaying ? stopSequence : startSequence}
          disabled={!isSubscribed && !isPlaying}
          className={`w-full font-bold py-3 rounded-lg transition-colors font-mono ${
            !isSubscribed
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {isPlaying ? '⏹️ STOP' : '▶️ PLAY'} SEQUENCE
        </button>

        {!isSubscribed && (
          <div className="text-center text-xs text-gray-500">
            Sequencer requires Pro subscription
          </div>
        )}
      </div>
    </div>
  );
}

