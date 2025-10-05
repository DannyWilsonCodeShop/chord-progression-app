'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import ChordKeyboard from '@/components/ChordKeyboard';
import ChordSelector from '@/components/ChordSelector';
import MPCInterface from '@/components/MPCInterface';
import RecordingInterface from '@/components/RecordingInterface';
import SubscriptionManager from '@/components/SubscriptionManager';
import { ChordProgression, KeySignature } from '@/types/chords';

export default function Home() {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeySignature>('C');
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression>('I-V-vi-IV');
  const [keyboardMapping, setKeyboardMapping] = useState<Record<string, string>>({});
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Initialize audio context and synthesizer (legacy)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const initializeAudio = useCallback(async () => {
    try {
      await Tone.start();
      const newSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle',
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1.2,
        },
      }).toDestination();
      
      setSynth(newSynth);
      setIsAudioInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

  // Generate keyboard mapping based on selected key and progression
  useEffect(() => {
    if (selectedKey && selectedProgression) {
      const mapping = generateKeyboardMapping(selectedKey, selectedProgression);
      setKeyboardMapping(mapping);
    }
  }, [selectedKey, selectedProgression]);

  // Play chord when key is pressed
  const playChord = useCallback((chord: string) => {
    if (synth && isAudioInitialized) {
      const notes = chord.split('-');
      synth.triggerAttackRelease(notes, '8n');
    }
  }, [synth, isAudioInitialized]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-6xl font-bold text-green-400 mb-4 font-mono tracking-wider sound-system-text">
            MPC STUDIO
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-mono">
            Professional Music Production Center
          </p>
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <ChordSelector
              selectedKey={selectedKey}
              selectedProgression={selectedProgression}
              onKeyChange={setSelectedKey}
              onProgressionChange={setSelectedProgression}
            />
          </div>

          {/* MPC Interface */}
          <div className="lg:col-span-2">
            <MPCInterface
              selectedKey={selectedKey}
              selectedProgression={selectedProgression}
              keyboardMapping={keyboardMapping}
            />
          </div>

          {/* Subscription & Recording Panel */}
          <div className="lg:col-span-1 space-y-6">
            <SubscriptionManager
              isSubscribed={isSubscribed}
              onSubscriptionUpdate={setIsSubscribed}
            />
            
            <RecordingInterface
              isSubscribed={isSubscribed}
              onUpgrade={() => setShowSubscriptionModal(true)}
            />
          </div>
        </div>

        {/* Legacy Interface Toggle */}
        <div className="mt-8 text-center">
          <details className="bg-gray-800 rounded-lg p-4">
            <summary className="text-green-400 font-mono cursor-pointer">
              LEGACY INTERFACE
            </summary>
            <div className="mt-4">
              {isAudioInitialized && (
                <ChordKeyboard
                  keyboardMapping={keyboardMapping}
                  onChordPlay={playChord}
                />
              )}
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}

// Helper function to generate keyboard mapping
function generateKeyboardMapping(key: KeySignature, progression: ChordProgression): Record<string, string> {
  const chordMaps = {
    'C': {
      'I': 'C-E-G',
      'ii': 'D-F-A',
      'iii': 'E-G-B',
      'IV': 'F-A-C',
      'V': 'G-B-D',
      'vi': 'A-C-E',
      'vii°': 'B-D-F',
      'I7': 'C-E-G-Bb',
      'ii7': 'D-F-A-C',
      'iii7': 'E-G-B-D',
      'IV7': 'F-A-C-Eb',
      'V7': 'G-B-D-F',
      'vi7': 'A-C-E-G',
      'vii°7': 'B-D-F-Ab'
    },
    'G': {
      'I': 'G-B-D',
      'ii': 'A-C-E',
      'iii': 'B-D-F#',
      'IV': 'C-E-G',
      'V': 'D-F#-A',
      'vi': 'E-G-B',
      'vii°': 'F#-A-C',
      'I7': 'G-B-D-F',
      'ii7': 'A-C-E-G',
      'iii7': 'B-D-F#-A',
      'IV7': 'C-E-G-Bb',
      'V7': 'D-F#-A-C',
      'vi7': 'E-G-B-D',
      'vii°7': 'F#-A-C-Eb'
    },
    'D': {
      'I': 'D-F#-A',
      'ii': 'E-G-B',
      'iii': 'F#-A-C#',
      'IV': 'G-B-D',
      'V': 'A-C#-E',
      'vi': 'B-D-F#',
      'vii°': 'C#-E-G',
      'I7': 'D-F#-A-C',
      'ii7': 'E-G-B-D',
      'iii7': 'F#-A-C#-E',
      'IV7': 'G-B-D-F',
      'V7': 'A-C#-E-G',
      'vi7': 'B-D-F#-A',
      'vii°7': 'C#-E-G-Bb'
    },
    'A': {
      'I': 'A-C#-E',
      'ii': 'B-D-F#',
      'iii': 'C#-E-G#',
      'IV': 'D-F#-A',
      'V': 'E-G#-B',
      'vi': 'F#-A-C#',
      'vii°': 'G#-B-D',
      'I7': 'A-C#-E-G',
      'ii7': 'B-D-F#-A',
      'iii7': 'C#-E-G#-B',
      'IV7': 'D-F#-A-C',
      'V7': 'E-G#-B-D',
      'vi7': 'F#-A-C#-E',
      'vii°7': 'G#-B-D-F'
    },
    'E': {
      'I': 'E-G#-B',
      'ii': 'F#-A-C#',
      'iii': 'G#-B-D#',
      'IV': 'A-C#-E',
      'V': 'B-D#-F#',
      'vi': 'C#-E-G#',
      'vii°': 'D#-F#-A',
      'I7': 'E-G#-B-D',
      'ii7': 'F#-A-C#-E',
      'iii7': 'G#-B-D#-F#',
      'IV7': 'A-C#-E-G',
      'V7': 'B-D#-F#-A',
      'vi7': 'C#-E-G#-B',
      'vii°7': 'D#-F#-A-C'
    }
  };

  const progressionMap: Record<ChordProgression, string[]> = {
    'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
    'vi-IV-I-V': ['vi', 'IV', 'I', 'V'],
    'I-vi-IV-V': ['I', 'vi', 'IV', 'V'],
    'ii-V-I': ['ii', 'V', 'I'],
    'I-IV-V-I': ['I', 'IV', 'V', 'I']
  };

  const chords = progressionMap[progression];
  const keyChords = chordMaps[key];
  
  // Use ASDF and JKL; keys for 8 pads
  const keyboardKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

  const mapping: Record<string, string> = {};
  
  // Map chords to keys, cycling through if we have more keys than chords
  keyboardKeys.forEach((key, index) => {
    const chordIndex = index % chords.length;
    const chord = chords[chordIndex];
    mapping[key] = keyChords[chord as keyof typeof keyChords] || chord;
  });

  return mapping;
}