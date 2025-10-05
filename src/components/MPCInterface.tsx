'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
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

export default function MPCInterface({
  selectedKey,
  selectedProgression,
  keyboardMapping,
}: MPCInterfaceProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('piano');
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [pads, setPads] = useState<Record<string, PadState>>({});
  const [samplers, setSamplers] = useState<Record<Instrument, Tone.Sampler | Tone.Synth | null>>({
    piano: null,
    guitar: null,
    bass: null,
    synth: null,
    drums: null,
  });

  // Initialize audio context and samplers
  const initializeAudio = useCallback(async () => {
    try {
      await Tone.start();
      
      // Create realistic instrument samplers
      const pianoSampler = new Tone.Sampler({
        urls: {
          C4: "https://tonejs.github.io/audio/casio/C4.mp3",
          "C#4": "https://tonejs.github.io/audio/casio/Cs4.mp3",
          D4: "https://tonejs.github.io/audio/casio/D4.mp3",
          "D#4": "https://tonejs.github.io/audio/casio/Ds4.mp3",
          E4: "https://tonejs.github.io/audio/casio/E4.mp3",
          F4: "https://tonejs.github.io/audio/casio/F4.mp3",
          "F#4": "https://tonejs.github.io/audio/casio/Fs4.mp3",
          G4: "https://tonejs.github.io/audio/casio/G4.mp3",
          "G#4": "https://tonejs.github.io/audio/casio/Gs4.mp3",
          A4: "https://tonejs.github.io/audio/casio/A4.mp3",
          "A#4": "https://tonejs.github.io/audio/casio/As4.mp3",
          B4: "https://tonejs.github.io/audio/casio/B4.mp3",
        },
        onload: () => console.log('Piano loaded'),
      }).toDestination();

      const guitarSampler = new Tone.Sampler({
        urls: {
          C3: "https://tonejs.github.io/audio/guitar/C3.mp3",
          "C#3": "https://tonejs.github.io/audio/guitar/Cs3.mp3",
          D3: "https://tonejs.github.io/audio/guitar/D3.mp3",
          "D#3": "https://tonejs.github.io/audio/guitar/Ds3.mp3",
          E3: "https://tonejs.github.io/audio/guitar/E3.mp3",
          F3: "https://tonejs.github.io/audio/guitar/F3.mp3",
          "F#3": "https://tonejs.github.io/audio/guitar/Fs3.mp3",
          G3: "https://tonejs.github.io/audio/guitar/G3.mp3",
          "G#3": "https://tonejs.github.io/audio/guitar/Gs3.mp3",
          A3: "https://tonejs.github.io/audio/guitar/A3.mp3",
          "A#3": "https://tonejs.github.io/audio/guitar/As3.mp3",
          B3: "https://tonejs.github.io/audio/guitar/B3.mp3",
        },
        onload: () => console.log('Guitar loaded'),
      }).toDestination();

      // Create synth for bass and synth instruments
      const synthSampler = new Tone.Synth({
        oscillator: {
          type: 'sawtooth',
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1.2,
        },
      }).toDestination();

      const bassSampler = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.4,
          release: 1.5,
        },
      }).toDestination();

      const drumsSampler = new Tone.Sampler({
        urls: {
          C1: "https://tonejs.github.io/audio/drum-samples/kick.mp3",
          "C#1": "https://tonejs.github.io/audio/drum-samples/snare.mp3",
          D1: "https://tonejs.github.io/audio/drum-samples/hihat.mp3",
          "D#1": "https://tonejs.github.io/audio/drum-samples/openhat.mp3",
        },
        onload: () => console.log('Drums loaded'),
      }).toDestination();

      setSamplers({
        piano: pianoSampler,
        guitar: guitarSampler,
        bass: bassSampler,
        synth: synthSampler,
        drums: drumsSampler,
      });

      setIsAudioInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

  // Play chord with selected instrument
  const playChord = useCallback((chord: string, padKey: string, velocity: number = 0.8) => {
    const sampler = samplers[selectedInstrument];
    if (!sampler || !isAudioInitialized) return;

    const notes = chord.split('-');
    const volume = Math.max(0.1, Math.min(1, velocity));

    notes.forEach((note, index) => {
      const delay = index * 0.05; // Slight stagger for chord effect
      
      if (selectedInstrument === 'piano' || selectedInstrument === 'guitar' || selectedInstrument === 'drums') {
        sampler.triggerAttackRelease(note, '8n', Tone.now() + delay, volume);
      } else {
        // For synth and bass, use different octaves
        const octave = selectedInstrument === 'bass' ? 2 : 4;
        const synthNote = `${note}${octave}`;
        sampler.triggerAttackRelease(synthNote, '8n', Tone.now() + delay, volume);
      }
    });
  }, [samplers, selectedInstrument, isAudioInitialized]);

  // Handle pad press
  const handlePadPress = useCallback((padKey: string, velocity: number = 0.8) => {
    const chord = keyboardMapping[padKey];
    if (!chord) return;

    setPads(prev => ({
      ...prev,
      [padKey]: { isPressed: true, velocity }
    }));

    playChord(chord, padKey, velocity);
  }, [keyboardMapping, playChord]);

  // Handle pad release
  const handlePadRelease = useCallback((padKey: string) => {
    setPads(prev => ({
      ...prev,
      [padKey]: { isPressed: false, velocity: 0 }
    }));
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (keyboardMapping[key] && !pads[key]?.isPressed) {
        event.preventDefault();
        handlePadPress(key, 0.8);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (keyboardMapping[key]) {
        event.preventDefault();
        handlePadRelease(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardMapping, pads, handlePadPress, handlePadRelease]);

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
          {/* Instrument Selector */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">INSTRUMENTS</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['piano', 'guitar', 'bass', 'synth', 'drums'] as Instrument[]).map((instrument) => (
                <button
                  key={instrument}
                  onClick={() => setSelectedInstrument(instrument)}
                  className={`px-4 py-3 rounded-lg font-mono tracking-wider transition-all ${
                    selectedInstrument === instrument
                      ? 'bg-green-600 text-black font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {instrument.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* MPC Pads */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider">PAD BANK</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(keyboardMapping).map(([key, chord]) => (
                <button
                  key={key}
                  onMouseDown={() => handlePadPress(key, 0.8)}
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
                    <div className="text-2xl font-bold mb-1">
                      {key.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-300 text-center leading-tight">
                      {chord}
                    </div>
                  </div>
                </button>
              ))}
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
              <div className="text-green-400 font-mono text-sm mb-2">PROGRESSION</div>
              <div className="text-white font-mono text-lg">{selectedProgression}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
