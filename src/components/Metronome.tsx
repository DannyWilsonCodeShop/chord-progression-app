'use client';

import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(-10);
  const loopRef = useRef<Tone.Loop | null>(null);
  const clickRef = useRef<Tone.MembraneSynth | null>(null);

  useEffect(() => {
    // Create click sound (woodblock-style)
    const click = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
      },
    }).toDestination();
    click.volume.value = volume;
    clickRef.current = click;

    // Create loop for clicks
    const loop = new Tone.Loop((time) => {
      click.triggerAttackRelease('C5', '32n', time);
    }, '4n'); // Quarter note intervals
    
    loopRef.current = loop;

    return () => {
      loop.dispose();
      click.dispose();
    };
  }, [volume]);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const toggleMetronome = async () => {
    if (!isPlaying) {
      await Tone.start();
      loopRef.current?.start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      Tone.Transport.stop();
      loopRef.current?.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-green-400 font-mono tracking-wider">
        METRONOME
      </h3>

      <div className="space-y-4">
        {/* BPM Control */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">BPM</label>
            <span className="text-green-400 font-mono font-bold">{bpm}</span>
          </div>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
          <div className="flex justify-between text-xs text-gray-500 font-mono mt-1">
            <span>40</span>
            <span>240</span>
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-gray-300 text-sm font-mono">Volume</label>
            <span className="text-green-400 font-mono font-bold text-sm">{volume} dB</span>
          </div>
          <input
            type="range"
            min="-40"
            max="0"
            value={volume}
            onChange={(e) => {
              const newVol = parseInt(e.target.value);
              setVolume(newVol);
              if (clickRef.current) {
                clickRef.current.volume.value = newVol;
              }
            }}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
        </div>

        {/* Start/Stop Button */}
        <button
          onClick={toggleMetronome}
          className={`w-full font-bold py-3 rounded-lg transition-colors font-mono ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-black'
          }`}
        >
          {isPlaying ? '⏹️ STOP' : '▶️ START'} METRONOME
        </button>
      </div>
    </div>
  );
}

