'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Instrument, KeySignature, ChordProgression } from '@/types/chords';

interface MPCInterfaceProps {
  selectedKey: KeySignature;
  selectedProgression: ChordProgression;
  keyboardMapping: Record<string, string>;
}

interface PadState {
  isPressed: boolean;
  velocity: number;
}

type SoundType = 'piano' | 'ep';

export default function MPCInterface({
  selectedKey,
  selectedProgression,
}: MPCInterfaceProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('piano');
  const [selectedChordSound, setSelectedChordSound] = useState<SoundType>('ep');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [pads, setPads] = useState<Record<string, PadState>>({});
  const [chordAudios, setChordAudios] = useState<Record<string, HTMLAudioElement>>({});
  const [bassAudios, setBassAudios] = useState<Record<string, HTMLAudioElement>>({});
  const [isSubscribed] = useState(false); // TODO: Connect to actual subscription state
  const [activeSounds, setActiveSounds] = useState<Record<string, HTMLAudioElement>>({}); // Track active playing sounds

  // Sound file mappings for C major diatonic chords
  const getChordSoundPath = useCallback((chordName: string, soundType: SoundType): string | null => {
    const chordMap: Record<string, { piano: string; ep: string }> = {
      'C': { piano: '/sounds/piano/chords/Piano - C.mp3', ep: '/sounds/ep/chords/EP - C1.mp3' },
      'Dm': { piano: '/sounds/piano/chords/Piano -  D min.mp3', ep: '/sounds/ep/chords/EP - Dm.mp3' },
      'Em': { piano: '/sounds/piano/chords/Piano -  E min.mp3', ep: '/sounds/ep/chords/EP - Em.mp3' },
      'F': { piano: '/sounds/piano/chords/Piano - F.mp3', ep: '/sounds/ep/chords/EP - F.mp3' },
      'G': { piano: '/sounds/piano/chords/Piano - G.mp3', ep: '/sounds/ep/chords/EP - G.mp3' },
      'Am': { piano: '/sounds/piano/chords/Piano -  A min.mp3', ep: '/sounds/ep/chords/EP - Am.mp3' },
      'Bdim': { piano: '/sounds/piano/chords/Piano -  B dim.mp3', ep: '/sounds/ep/chords/EP - B Dim.mp3' },
      'C2': { piano: '/sounds/piano/chords/Piano - C2.mp3', ep: '/sounds/ep/chords/EP - C2.mp3' },
    };
    
    return chordMap[chordName]?.[soundType] || null;
  }, []);

  // Sound file mappings for bass notes (piano-style layout)
  const getBassSoundPath = useCallback((note: string): string => {
    const bassMap: Record<string, string> = {
      'C': '/sounds/bass/tones/Bass/Bass - C1.mp3',
      'C#': '/sounds/bass/tones/Bass/Bass - C#.mp3',
      'D': '/sounds/bass/tones/Bass/Bass - D.mp3',
      'D#': '/sounds/bass/tones/Bass/Bass - D#.mp3',
      'E': '/sounds/bass/tones/Bass/Bass - E.mp3',
      'F': '/sounds/bass/tones/Bass/Bass - F.mp3',
      'F#': '/sounds/bass/tones/Bass/Bass - F#.mp3',
      'G': '/sounds/bass/tones/Bass/Bass - G.mp3',
      'G#': '/sounds/bass/tones/Bass/Bass - G#.mp3',
      'A': '/sounds/bass/tones/Bass/Bass - A.mp3',
      'A#': '/sounds/bass/tones/Bass/Bass - A#.mp3',
      'B': '/sounds/bass/tones/Bass/Bass - B.mp3',
      'C2': '/sounds/bass/tones/Bass/Bass - C2.mp3',
    };
    
    return bassMap[note] || '';
  }, []);

  // Initialize audio with actual sound files
  const initializeAudio = useCallback(async () => {
    try {
      // Load chord sounds
      const chordSounds: Record<string, HTMLAudioElement> = {};
      const chordNames = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C2'];
      
      chordNames.forEach(chord => {
        const path = getChordSoundPath(chord, selectedChordSound);
        if (path) {
          chordSounds[chord] = new Audio(path);
          chordSounds[chord].preload = 'auto';
        }
      });

      // Load bass sounds
      const bassSounds: Record<string, HTMLAudioElement> = {};
      const bassNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C2'];
      
      bassNotes.forEach(note => {
        const path = getBassSoundPath(note);
        if (path) {
          bassSounds[note] = new Audio(path);
          bassSounds[note].preload = 'auto';
        }
      });

      setChordAudios(chordSounds);
      setBassAudios(bassSounds);
      setIsAudioInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [selectedChordSound, getChordSoundPath, getBassSoundPath]);

  // Reload chord sounds when sound type changes
  useEffect(() => {
    if (isAudioInitialized) {
      const chordSounds: Record<string, HTMLAudioElement> = {};
      const chordNames = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C2'];
      
      chordNames.forEach(chord => {
        const path = getChordSoundPath(chord, selectedChordSound);
        if (path) {
          chordSounds[chord] = new Audio(path);
          chordSounds[chord].preload = 'auto';
        }
      });

      setChordAudios(chordSounds);
    }
  }, [selectedChordSound, isAudioInitialized, getChordSoundPath]);

  // Keyboard mappings for chords and bass (memoized to prevent recreating on every render)
  const chordKeyMap = useMemo(() => ({
    'a': 'C',
    's': 'Dm',
    'd': 'Em',
    'f': 'F',
    'j': 'G',
    'k': 'Am',
    'l': 'Bdim',
    ';': 'C2',
  }), []);

  const bassKeyMap = useMemo(() => ({
    // White keys (natural notes)
    'z': 'C',
    'x': 'D',
    'c': 'E',
    'v': 'F',
    'b': 'G',
    'n': 'A',
    'm': 'B',
    ',': 'C2',
    // Black keys (sharps)
    's': 'C#',
    'd': 'D#',
    'g': 'F#',
    'h': 'G#',
    'j': 'A#',
  }), []);

  // Play chord (organ-style - sustain while held)
  const playChord = useCallback((chordName: string, keyId: string) => {
    if (!isAudioInitialized) return;

    const audio = chordAudios[chordName];
    if (audio) {
      // Clone and play to allow overlapping sounds
      const sound = audio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.7;
      sound.loop = true; // Loop for sustained organ-like effect
      sound.play().catch(err => console.error('Error playing chord:', err));
      
      // Store active sound for later stopping
      setActiveSounds(prev => ({ ...prev, [keyId]: sound }));
    }
  }, [chordAudios, isAudioInitialized]);

  // Play bass note (organ-style - sustain while held)
  const playBass = useCallback((note: string, keyId: string) => {
    if (!isAudioInitialized) return;

    const audio = bassAudios[note];
    if (audio) {
      // Clone and play to allow overlapping sounds
      const sound = audio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.8;
      sound.loop = true; // Loop for sustained organ-like effect
      sound.play().catch(err => console.error('Error playing bass:', err));
      
      // Store active sound for later stopping
      setActiveSounds(prev => ({ ...prev, [keyId]: sound }));
    }
  }, [bassAudios, isAudioInitialized]);

  // Stop sound (when key is released)
  const stopSound = useCallback((keyId: string) => {
    const sound = activeSounds[keyId];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      setActiveSounds(prev => {
        const newSounds = { ...prev };
        delete newSounds[keyId];
        return newSounds;
      });
    }
  }, [activeSounds]);

  // Handle pad press (for chord pads)
  const handlePadPress = useCallback((chordName: string, padKey: string) => {
    // Don't re-trigger if already pressed
    if (pads[padKey]?.isPressed) return;
    
    setPads(prev => ({
      ...prev,
      [padKey]: { isPressed: true, velocity: 0.8 }
    }));

    playChord(chordName, `chord-${padKey}`);
  }, [playChord, pads]);

  // Handle pad release
  const handlePadRelease = useCallback((padKey: string) => {
    setPads(prev => ({
      ...prev,
      [padKey]: { isPressed: false, velocity: 0 }
    }));
    
    // Stop the sound when pad is released
    stopSound(`chord-${padKey}`);
  }, [stopSound]);

  // Handle keyboard events for both chords and bass
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Priority logic: Bass mode gets overlapping keys (s, d, g, h, j)
      // In bass mode, ALL bass keys (including overlapping ones) play bass
      // In chord mode, chord keys play chords
      
      if (selectedInstrument === 'bass' && key in bassKeyMap) {
        // BASS MODE - play bass notes
        if (!pads[`bass-${key}`]?.isPressed) {
          event.preventDefault();
          setPads(prev => ({
            ...prev,
            [`bass-${key}`]: { isPressed: true, velocity: 0.8 }
          }));
          playBass(bassKeyMap[key as keyof typeof bassKeyMap], `bass-${key}`);
        }
      } else if (selectedInstrument !== 'bass' && key in chordKeyMap) {
        // CHORD MODE - play chords (only when NOT in bass mode)
        if (!pads[`chord-${key}`]?.isPressed) {
          event.preventDefault();
          setPads(prev => ({
            ...prev,
            [`chord-${key}`]: { isPressed: true, velocity: 0.8 }
          }));
          playChord(chordKeyMap[key as keyof typeof chordKeyMap], `chord-${key}`);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Stop bass sounds
      if (key in bassKeyMap && selectedInstrument === 'bass') {
        event.preventDefault();
        setPads(prev => ({
          ...prev,
          [`bass-${key}`]: { isPressed: false, velocity: 0 }
        }));
        stopSound(`bass-${key}`);
      }
      
      // Stop chord sounds
      if (key in chordKeyMap && selectedInstrument !== 'bass') {
        event.preventDefault();
        setPads(prev => ({
          ...prev,
          [`chord-${key}`]: { isPressed: false, velocity: 0 }
        }));
        stopSound(`chord-${key}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [chordKeyMap, bassKeyMap, pads, playChord, playBass, stopSound, selectedInstrument]);

  return (
    <div className="mpc-container bg-black rounded-3xl p-8 shadow-2xl border-4 border-gray-800">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2 font-mono tracking-wider">
          MPC STUDIO
        </h1>
        <div className="text-sm text-gray-400 font-mono">
          {selectedKey} • {selectedProgression} • {selectedInstrument.toUpperCase()}
        </div>
      </div>

      {!isAudioInitialized && (
        <div className="text-center mb-8">
          <button
            onClick={initializeAudio}
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 px-8 rounded-lg transition-colors font-mono tracking-wider"
          >
            INITIALIZE AUDIO
          </button>
        </div>
      )}

      {isAudioInitialized && (
        <>
          {/* Sound Type Selector */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">CHORD SOUND</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {(['ep', 'piano'] as SoundType[]).map((soundType) => {
                const isLocked = soundType === 'piano' && !isSubscribed;
                return (
                  <button
                    key={soundType}
                    onClick={() => {
                      if (isLocked) {
                        alert('Subscribe to unlock Piano sounds!');
                      } else {
                        setSelectedChordSound(soundType);
                      }
                    }}
                    disabled={isLocked}
                    className={`px-4 py-3 rounded-lg font-mono tracking-wider transition-all relative ${
                      selectedChordSound === soundType
                        ? 'bg-green-600 text-black font-bold'
                        : isLocked
                        ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {soundType === 'ep' ? 'ELECTRIC PIANO' : 'PIANO'}
                    {isLocked && (
                      <span className="ml-2 text-yellow-400">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
            {!isSubscribed && (
              <p className="text-center text-xs text-yellow-400 mt-2 font-mono">
                🔒 Subscribe to unlock Piano sounds
              </p>
            )}
          </div>

          {/* Chord Pads */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">C MAJOR CHORDS</h3>
              <p className="text-xs text-gray-400 font-mono">Keys: A S D F J K L ;</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(chordKeyMap).map(([key, chord]) => (
                <button
                  key={key}
                  onMouseDown={() => handlePadPress(chord, key)}
                  onMouseUp={() => handlePadRelease(key)}
                  onMouseLeave={() => handlePadRelease(key)}
                  className={`mpc-pad relative aspect-square rounded-xl font-mono transition-all duration-100 ${
                    pads[key]?.isPressed
                      ? 'bg-green-500 scale-95 shadow-lg'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  style={{
                    boxShadow: pads[key]?.isPressed 
                      ? '0 0 20px rgba(34, 197, 94, 0.5)' 
                      : 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-3xl font-bold mb-2">
                      {key.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-300 font-semibold">
                      {chord}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">MODE</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              <button
                onClick={() => setSelectedInstrument('piano')}
                className={`px-4 py-3 rounded-lg font-mono tracking-wider transition-all ${
                  selectedInstrument === 'piano'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                CHORD MODE
              </button>
              <button
                onClick={() => setSelectedInstrument('bass')}
                className={`px-4 py-3 rounded-lg font-mono tracking-wider transition-all ${
                  selectedInstrument === 'bass'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                BASS MODE
              </button>
            </div>
          </div>

          {/* Bass Keyboard - Piano Layout */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">BASS KEYBOARD</h3>
              <p className="text-xs text-gray-400 font-mono">White Keys: Z X C V B N M , | Black Keys: S D G H J</p>
            </div>
            
            {/* Piano-style layout */}
            <div className="relative bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
              {/* Black keys row */}
              <div className="flex justify-start items-start mb-2 pl-12 gap-2">
                {[
                  { key: 's', note: 'C#' },
                  { key: 'd', note: 'D#' },
                  { key: 'spacer1', note: '' },
                  { key: 'g', note: 'F#' },
                  { key: 'h', note: 'G#' },
                  { key: 'j', note: 'A#' },
                ].map((item) => 
                  item.key.startsWith('spacer') ? (
                    <div key={item.key} className="w-16"></div>
                  ) : (
                    <button
                      key={item.key}
                      onMouseDown={() => {
                        if (!pads[`bass-${item.key}`]?.isPressed) {
                          setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: true, velocity: 0.8 } }));
                          playBass(item.note, `bass-${item.key}`);
                        }
                      }}
                      onMouseUp={() => {
                        setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: false, velocity: 0 } }));
                        stopSound(`bass-${item.key}`);
                      }}
                      onMouseLeave={() => {
                        if (pads[`bass-${item.key}`]?.isPressed) {
                          setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: false, velocity: 0 } }));
                          stopSound(`bass-${item.key}`);
                        }
                      }}
                      className={`w-16 h-24 rounded-lg font-mono text-white font-bold transition-all ${
                        pads[`bass-${item.key}`]?.isPressed
                          ? 'bg-purple-600 scale-95'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      style={{
                        boxShadow: pads[`bass-${item.key}`]?.isPressed 
                          ? '0 0 15px rgba(147, 51, 234, 0.5)' 
                          : 'none',
                      }}
                    >
                      <div className="text-xl">{item.key.toUpperCase()}</div>
                      <div className="text-xs mt-1">{item.note}</div>
                    </button>
                  )
                )}
              </div>
              
              {/* White keys row */}
              <div className="flex justify-start items-start gap-2">
                {[
                  { key: 'z', note: 'C' },
                  { key: 'x', note: 'D' },
                  { key: 'c', note: 'E' },
                  { key: 'v', note: 'F' },
                  { key: 'b', note: 'G' },
                  { key: 'n', note: 'A' },
                  { key: 'm', note: 'B' },
                  { key: ',', note: 'C2' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onMouseDown={() => {
                      if (!pads[`bass-${item.key}`]?.isPressed) {
                        setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: true, velocity: 0.8 } }));
                        playBass(item.note, `bass-${item.key}`);
                      }
                    }}
                    onMouseUp={() => {
                      setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: false, velocity: 0 } }));
                      stopSound(`bass-${item.key}`);
                    }}
                    onMouseLeave={() => {
                      if (pads[`bass-${item.key}`]?.isPressed) {
                        setPads(prev => ({ ...prev, [`bass-${item.key}`]: { isPressed: false, velocity: 0 } }));
                        stopSound(`bass-${item.key}`);
                      }
                    }}
                    className={`w-16 h-32 rounded-lg font-mono font-bold transition-all ${
                      pads[`bass-${item.key}`]?.isPressed
                        ? 'bg-blue-500 text-white scale-95'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                    style={{
                      boxShadow: pads[`bass-${item.key}`]?.isPressed 
                        ? '0 0 15px rgba(59, 130, 246, 0.5)' 
                        : '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="text-xl">{item.key.toUpperCase()}</div>
                    <div className="text-sm mt-2">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-green-400 font-mono text-sm mb-2">TEMPO</div>
              <div className="text-white font-mono text-xl">120 BPM</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-green-400 font-mono text-sm mb-2">KEY</div>
              <div className="text-white font-mono text-xl">{selectedKey}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-green-400 font-mono text-sm mb-2">MODE</div>
              <div className="text-white font-mono text-lg">{selectedInstrument === 'bass' ? 'BASS' : 'CHORDS'}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
