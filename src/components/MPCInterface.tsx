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

  // Sound file mappings for chords (diatonic + chromatic)
  const getChordSoundPath = useCallback((chordName: string, soundType: SoundType): string | null => {
    // Complete chromatic mapping (Piano) - using encodeURIComponent for special chars
    const pianoFilenames: Record<string, string> = {
      // Natural Major (ONE space)
      'C': 'Piano - C.mp3', 'D': 'Piano - D.mp3', 'E': 'Piano - E.mp3',
      'F': 'Piano - F.mp3', 'G': 'Piano - G.mp3', 'A': 'Piano - A.mp3', 'B': 'Piano - B.mp3',
      // Sharp Major (ONE space)
      'C#': 'Piano - C#.mp3', 'D#': 'Piano - D#.mp3', 'F#': 'Piano - F#.mp3',
      'G#': 'Piano - G#.mp3', 'A#': 'Piano - A#.mp3',
      // Natural Minor (TWO spaces, C uses C1)
      'Cmin': 'Piano -  C1 min.mp3', 'Dmin': 'Piano -  D min.mp3', 'Emin': 'Piano -  E min.mp3',
      'Fmin': 'Piano -  F min.mp3', 'Gmin': 'Piano -  G min.mp3', 'Amin': 'Piano -  A min.mp3', 'Bmin': 'Piano -  B min.mp3',
      // Sharp Minor (TWO spaces)
      'C#min': 'Piano -  C# min.mp3', 'D#min': 'Piano -  D# min.mp3', 'F#min': 'Piano -  F# min.mp3',
      'G#min': 'Piano -  G# min.mp3', 'A#min': 'Piano -  A# min.mp3',
      // Natural Augmented (TWO spaces, C uses C1)
      'CAug': 'Piano -  C1 Aug.mp3', 'DAug': 'Piano -  D Aug.mp3', 'EAug': 'Piano -  E Aug.mp3',
      'FAug': 'Piano -  F Aug.mp3', 'GAug': 'Piano -  G Aug.mp3', 'AAug': 'Piano -  A Aug.mp3', 'BAug': 'Piano -  B Aug.mp3',
      // Sharp Augmented (TWO spaces)
      'C#Aug': 'Piano -  C# Aug.mp3', 'D#Aug': 'Piano -  D# Aug.mp3', 'F#Aug': 'Piano -  F# Aug.mp3',
      'G#Aug': 'Piano -  G# Aug.mp3', 'A#Aug': 'Piano -  A# Aug.mp3',
      // Natural Diminished (TWO spaces, C uses C1, F is special - ONE space)
      'Cdim': 'Piano -  C1 dim.mp3', 'Ddim': 'Piano -  D dim.mp3', 'Edim': 'Piano -  E dim.mp3',
      'Fdim': 'Piano - F dim.mp3', 'Gdim': 'Piano -  G dim.mp3', 'Adim': 'Piano -  A dim.mp3', 'Bdim': 'Piano -  B dim.mp3',
      // Sharp Diminished (TWO spaces)
      'C#dim': 'Piano -  C# dim.mp3', 'D#dim': 'Piano -  D# dim.mp3', 'F#dim': 'Piano -  F# dim.mp3',
      'G#dim': 'Piano -  G# dim.mp3', 'A#dim': 'Piano -  A# dim.mp3',
      // Diatonic alternative names
      'Dm': 'Piano -  D min.mp3', 'Em': 'Piano -  E min.mp3', 'Am': 'Piano -  A min.mp3',
      'C2': 'Piano - C2.mp3',
    };
    
    // EP Map (diatonic only)
    const epFilenames: Record<string, string> = {
      'C': 'EP - C1.mp3', 'Dm': 'EP - Dm.mp3', 'Em': 'EP - Em.mp3',
      'F': 'EP - F.mp3', 'G': 'EP - G.mp3', 'Am': 'EP - Am.mp3',
      'Bdim': 'EP - B Dim.mp3', 'C2': 'EP - C2.mp3',
    };
    
    if (soundType === 'piano') {
      const filename = pianoFilenames[chordName];
      if (filename) {
        // Encode the filename to handle # and other special characters
        const encodedFilename = encodeURIComponent(filename);
        return `/sounds/piano/chords/${encodedFilename}`;
      }
    } else {
      const filename = epFilenames[chordName];
      if (filename) {
        return `/sounds/ep/chords/${encodeURIComponent(filename)}`;
      }
    }
    
    return null;
  }, []);

  // Sound file mappings for bass notes
  const getBassSoundPath = useCallback((note: string): string => {
    const bassFilenames: Record<string, string> = {
      'C': 'Bass - C1.mp3',
      'C#': 'Bass - C#.mp3',
      'D': 'Bass - D.mp3',
      'D#': 'Bass - D#.mp3',
      'E': 'Bass - E.mp3',
      'F': 'Bass - F.mp3',
      'F#': 'Bass - F#.mp3',
      'G': 'Bass - G.mp3',
      'G#': 'Bass - G#.mp3',
      'A': 'Bass - A.mp3',
      'A#': 'Bass - A#.mp3',
      'B': 'Bass - B.mp3',
      'C2': 'Bass - C2.mp3',
    };
    
    const filename = bassFilenames[note];
    return filename ? `/sounds/bass/tones/Bass/${encodeURIComponent(filename)}` : '';
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

  // Auto-switch to Piano when chromatic is selected
  useEffect(() => {
    if (selectedProgression === 'chromatic' && selectedChordSound === 'ep') {
      setSelectedChordSound('piano');
    }
  }, [selectedProgression, selectedChordSound]);

  // Reload chord sounds when sound type or progression changes
  useEffect(() => {
    if (isAudioInitialized) {
      const chordSounds: Record<string, HTMLAudioElement> = {};
      
      if (selectedProgression === 'chromatic') {
        // Load all chromatic chords (Piano only)
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const types = ['', 'min', 'Aug', 'dim'];
        
        notes.forEach(note => {
          types.forEach(type => {
            const chordName = type ? `${note}${type}` : note;
            const path = getChordSoundPath(chordName, 'piano'); // Force piano for chromatic
            if (path) {
              chordSounds[chordName] = new Audio(path);
              chordSounds[chordName].preload = 'auto';
            }
          });
        });
      } else {
        // Load only diatonic chords
        const chordNames = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C2'];
        
        chordNames.forEach(chord => {
          const path = getChordSoundPath(chord, selectedChordSound);
          if (path) {
            chordSounds[chord] = new Audio(path);
            chordSounds[chord].preload = 'auto';
          }
        });
      }

      setChordAudios(chordSounds);
    }
  }, [selectedChordSound, selectedProgression, isAudioInitialized, getChordSoundPath]);

  // Map selected progression to chords (memoized based on progression)
  const chordKeyMap = useMemo(() => {
    // Special handling for chromatic progression
    if (selectedProgression === 'chromatic') {
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const mapping: Record<string, string> = {};
      
      // Number row (1-0): Augmented chords (need chromatic samples)
      const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
      numKeys.forEach((key, index) => {
        if (index < notes.length) mapping[key] = `${notes[index]}Aug`;
      });
      
      // Top letter row (Q-P): Major chords
      const topKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
      topKeys.forEach((key, index) => {
        if (index < notes.length) mapping[key] = notes[index];
      });
      
      // Home row (A-;): Minor chords
      const homeKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
      homeKeys.forEach((key, index) => {
        if (index < notes.length) mapping[key] = `${notes[index]}min`;
      });
      
      // Bottom row (Z-/): Diminished chords
      const bottomKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
      bottomKeys.forEach((key, index) => {
        if (index < notes.length) mapping[key] = `${notes[index]}dim`;
      });
      
      return mapping;
    }
    
    // Regular progressions
    const progressionMap: Record<string, string[]> = {
      'I-ii-iii-IV-V-vi-vii°-I': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'C2'],
      'I-V-vi-IV': ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'], // Repeat to fill 8 keys
      'vi-IV-I-V': ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],
      'I-vi-IV-V': ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
      'ii-V-I': ['Dm', 'G', 'C', 'Dm', 'G', 'C', 'Dm', 'G'], // Repeat to fill 8 keys
      'I-IV-V-I': ['C', 'F', 'G', 'C', 'F', 'G', 'C', 'F'],
    };
    
    const chords = progressionMap[selectedProgression] || progressionMap['I-ii-iii-IV-V-vi-vii°-I'];
    const keys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
    
    const mapping: Record<string, string> = {};
    keys.forEach((key, index) => {
      mapping[key] = chords[index];
    });
    
    return mapping;
  }, [selectedProgression]);

  const bassKeyMap = useMemo(() => ({
    // Chromatic sequence across bottom row
    'z': 'C',
    'x': 'C#',
    'c': 'D',
    'v': 'D#',
    'g': 'E',
    'b': 'F',
    'h': 'F#',
    'n': 'G',
    'm': 'G#',
    ',': 'A',
    '.': 'A#',
    '/': 'B',
    ' ': 'C2', // Spacebar
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

  // Stop sound with fade out (when key is released)
  const stopSound = useCallback((keyId: string) => {
    const sound = activeSounds[keyId];
    if (sound) {
      // Fade out over 50ms to avoid click
      const fadeOutDuration = 50;
      const fadeOutSteps = 10;
      const stepTime = fadeOutDuration / fadeOutSteps;
      const volumeStep = sound.volume / fadeOutSteps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        sound.volume = Math.max(0, sound.volume - volumeStep);
        
        if (currentStep >= fadeOutSteps) {
          clearInterval(fadeInterval);
          sound.pause();
          sound.currentTime = 0;
          sound.volume = 0.7; // Reset volume for next play
        }
      }, stepTime);
      
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
              {(['piano', 'ep'] as SoundType[]).map((soundType) => {
                const isDisabled = soundType === 'ep' && selectedProgression === 'chromatic';
                return (
                  <button
                    key={soundType}
                    onClick={() => {
                      if (isDisabled) {
                        alert('Chromatic progression only supports Piano sounds');
                      } else {
                        setSelectedChordSound(soundType);
                      }
                    }}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-lg font-mono tracking-wider transition-all ${
                      selectedChordSound === soundType
                        ? 'bg-green-600 text-black font-bold'
                        : isDisabled
                        ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {soundType === 'ep' ? 'ELECTRIC PIANO' : 'PIANO'}
                    {isDisabled && <span className="ml-2">⚠️</span>}
                  </button>
                );
              })}
            </div>
            {selectedProgression === 'chromatic' && (
              <p className="text-center text-xs text-yellow-400 mt-2 font-mono">
                ⚠️ Chromatic mode uses Piano sound only
              </p>
            )}
          </div>

          {/* Chord Pads */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">
                {selectedProgression === 'chromatic' ? 'CHROMATIC KEYBOARD (48 CHORDS)' :
                 selectedProgression === 'I-ii-iii-IV-V-vi-vii°-I' ? 'C MAJOR SCALE' : 'CHORD PROGRESSION'}
              </h3>
              {selectedProgression === 'chromatic' ? (
                <div className="text-xs text-gray-400 font-mono space-y-1">
                  <p>1-0,-,= = Aug | Q-P,[,] = Major | A-;,&apos; = Minor | Z-/,. = Dim</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-mono">Keys: A S D F J K L ;</p>
              )}
              {selectedInstrument !== 'piano' && (
                <p className="text-xs text-purple-400 font-mono mt-1">
                  ⚠️ Switch to CHORD MODE to play chords
                </p>
              )}
            </div>
            <div className={selectedProgression === 'chromatic' ? 'grid grid-cols-12 gap-1' : 'grid grid-cols-4 gap-4'}>
              {Object.entries(chordKeyMap).map(([key, chord]) => (
                <button
                  key={key}
                  onMouseDown={() => handlePadPress(chord, key)}
                  onMouseUp={() => handlePadRelease(key)}
                  onMouseLeave={() => handlePadRelease(key)}
                  className={`mpc-pad relative ${selectedProgression === 'chromatic' ? 'h-16' : 'aspect-square'} rounded-xl font-mono transition-all duration-100 ${
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
                    <div className={selectedProgression === 'chromatic' ? 'text-lg font-bold' : 'text-3xl font-bold mb-2'}>
                      {key.toUpperCase()}
                    </div>
                    <div className={selectedProgression === 'chromatic' ? 'text-xs text-gray-300' : 'text-sm text-gray-300 font-semibold'}>
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

          {/* Bass Keyboard - Chromatic Layout */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">BASS KEYBOARD</h3>
              <p className="text-xs text-gray-400 font-mono">Chromatic: Z X C V G B H N M , . / SPACE</p>
              {selectedInstrument === 'bass' ? (
                <p className="text-xs text-purple-400 font-mono mt-1 font-bold">
                  ✓ BASS MODE ACTIVE - Keys above will play bass notes
                </p>
              ) : (
                <p className="text-xs text-blue-400 font-mono mt-1">
                  ℹ️ Enable BASS MODE above to play bass notes
                </p>
              )}
            </div>
            
            {/* Chromatic bass keyboard */}
            <div className="relative bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
              <div className="flex justify-center items-center gap-1 flex-wrap">
                {[
                  { key: 'z', note: 'C', label: 'Z' },
                  { key: 'x', note: 'C#', label: 'X' },
                  { key: 'c', note: 'D', label: 'C' },
                  { key: 'v', note: 'D#', label: 'V' },
                  { key: 'g', note: 'E', label: 'G' },
                  { key: 'b', note: 'F', label: 'B' },
                  { key: 'h', note: 'F#', label: 'H' },
                  { key: 'n', note: 'G', label: 'N' },
                  { key: 'm', note: 'G#', label: 'M' },
                  { key: ',', note: 'A', label: ',' },
                  { key: '.', note: 'A#', label: '.' },
                  { key: '/', note: 'B', label: '/' },
                  { key: ' ', note: 'C2', label: 'SPACE' },
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
                    className={`${item.key === ' ' ? 'w-32' : 'w-14'} h-20 rounded-lg font-mono font-bold transition-all ${
                      pads[`bass-${item.key}`]?.isPressed
                        ? 'bg-purple-500 text-white scale-95'
                        : item.note.includes('#') 
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                    style={{
                      boxShadow: pads[`bass-${item.key}`]?.isPressed 
                        ? '0 0 15px rgba(168, 85, 247, 0.5)' 
                        : item.note.includes('#')
                        ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                        : '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs mt-1">{item.note}</div>
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
