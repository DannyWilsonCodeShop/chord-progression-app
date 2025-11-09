'use client';

import { useState, useRef } from 'react';
import * as Tone from 'tone';

interface Loop {
  id: string;
  name: string;
  player: Tone.Player;
  recording: Blob;
  isPlaying: boolean;
}

export default function LoopStation() {
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<Tone.Recorder | null>(null);
  const [loopsPlaying, setLoopsPlaying] = useState(false);

  const startRecording = async () => {
    try {
      await Tone.start();
      
      const recorder = new Tone.Recorder();
      Tone.getDestination().connect(recorder);
      recorderRef.current = recorder;
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start loop recording:', error);
      alert('Recording failed. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    const blob = await recorderRef.current.stop();
    setIsRecording(false);

    if (blob.size < 1000) {
      alert('Recording is empty. Play sounds while recording!');
      return;
    }

    // Create Tone.Player from the recorded blob
    const url = URL.createObjectURL(blob);
    const player = new Tone.Player(url).toDestination();
    player.loop = true;
    
    // Wait for player to load
    await player.load(url);

    const loop: Loop = {
      id: Date.now().toString(),
      name: `Loop ${loops.length + 1}`,
      player,
      recording: blob,
      isPlaying: false,
    };

    setLoops(prev => [...prev, loop]);
    alert('Loop saved! Click play to hear it back.');
  };

  const toggleLoop = (loopId: string) => {
    setLoops(prev => prev.map(loop => {
      if (loop.id === loopId) {
        if (loop.isPlaying) {
          loop.player.stop();
        } else {
          loop.player.start();
        }
        return { ...loop, isPlaying: !loop.isPlaying };
      }
      return loop;
    }));
  };

  const playAllLoops = async () => {
    await Tone.start();
    Tone.Transport.start();
    
    loops.forEach(loop => {
      if (!loop.isPlaying) {
        loop.player.sync().start(0);
        setLoops(prev => prev.map(l => 
          l.id === loop.id ? { ...l, isPlaying: true } : l
        ));
      }
    });
    
    setLoopsPlaying(true);
  };

  const stopAllLoops = () => {
    Tone.Transport.stop();
    loops.forEach(loop => {
      loop.player.unsync().stop();
    });
    setLoops(prev => prev.map(l => ({ ...l, isPlaying: false })));
    setLoopsPlaying(false);
  };

  const deleteLoop = (loopId: string) => {
    const loop = loops.find(l => l.id === loopId);
    if (loop) {
      loop.player.dispose();
      setLoops(prev => prev.filter(l => l.id !== loopId));
    }
  };

  const downloadLoop = (loop: Loop) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(loop.recording);
    link.download = `${loop.name}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-purple-400 font-mono tracking-wider">
        LOOP STATION
      </h3>

      {/* Recording Controls */}
      <div className="mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors font-mono"
          >
            ⏺️ RECORD NEW LOOP
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors font-mono animate-pulse"
          >
            ⏹️ STOP & SAVE LOOP
          </button>
        )}
      </div>

      {/* Master Controls */}
      {loops.length > 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={playAllLoops}
            disabled={loopsPlaying}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors font-mono text-sm"
          >
            ▶️ ALL
          </button>
          <button
            onClick={stopAllLoops}
            disabled={!loopsPlaying}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors font-mono text-sm"
          >
            ⏹️ STOP
          </button>
        </div>
      )}

      {/* Loops List */}
      {loops.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          No loops yet. Record your first loop!
        </div>
      ) : (
        <div className="space-y-2">
          {loops.map((loop) => (
            <div
              key={loop.id}
              className="bg-gray-800 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-white font-mono text-sm">{loop.name}</div>
                  <div className="text-gray-400 text-xs">
                    {(loop.recording.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-mono ${
                  loop.isPlaying ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                }`}>
                  {loop.isPlaying ? '▶️ ON' : '⏸️ OFF'}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => toggleLoop(loop.id)}
                  className={`py-1 rounded font-mono text-xs ${
                    loop.isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {loop.isPlaying ? '⏸️' : '▶️'}
                </button>
                <button
                  onClick={() => downloadLoop(loop)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 rounded font-mono text-xs"
                >
                  💾
                </button>
                <button
                  onClick={() => {
                    const newName = prompt('Rename loop:', loop.name);
                    if (newName) {
                      setLoops(prev => prev.map(l => 
                        l.id === loop.id ? { ...l, name: newName } : l
                      ));
                    }
                  }}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-1 rounded font-mono text-xs"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${loop.name}?`)) {
                      deleteLoop(loop.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 rounded font-mono text-xs"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loops.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-400 text-xs font-mono text-center">
            💡 Tip: Record multiple loops and layer them together!
          </div>
        </div>
      )}
    </div>
  );
}

