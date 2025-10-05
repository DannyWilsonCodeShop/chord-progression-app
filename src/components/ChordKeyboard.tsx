'use client';

import { useState, useEffect } from 'react';

interface ChordKeyboardProps {
  keyboardMapping: Record<string, string>;
  onChordPlay: (chord: string) => void;
}

export default function ChordKeyboard({
  keyboardMapping,
  onChordPlay,
}: ChordKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Prevent default behavior for our mapped keys
      if (keyboardMapping[key]) {
        event.preventDefault();
        
        // Add visual feedback
        setPressedKeys(prev => new Set([...prev, key]));
        
        // Play the chord
        onChordPlay(keyboardMapping[key]);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      if (keyboardMapping[key]) {
        event.preventDefault();
        
        // Remove visual feedback
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardMapping, onChordPlay]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Virtual Keyboard</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Press the keys on your physical keyboard to play chords, or click the virtual keys below:
        </p>
        
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(keyboardMapping).map(([key, chord]) => (
            <button
              key={key}
              onClick={() => {
                // Add visual feedback
                setPressedKeys(prev => new Set([...prev, key]));
                
                // Play the chord
                onChordPlay(chord);
                
                // Remove visual feedback after a short delay
                setTimeout(() => {
                  setPressedKeys(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(key);
                    return newSet;
                  });
                }, 200);
              }}
              className={`chord-key ${
                pressedKeys.has(key) ? 'pressed' : ''
              }`}
              style={{
                gridColumn: 'span 1',
              }}
            >
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {key.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 font-mono">
                {chord}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use your physical keyboard keys: {Object.keys(keyboardMapping).map(k => k.toUpperCase()).join(', ')}</li>
          <li>• Or click the virtual keys above</li>
          <li>• Each key plays a different chord in your selected progression</li>
          <li>• Change the key signature and progression using the settings above</li>
        </ul>
      </div>
    </div>
  );
}
