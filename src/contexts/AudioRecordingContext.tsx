'use client';

import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';

interface AudioRecordingContextType {
  audioContext: AudioContext | null;
  destination: MediaStreamAudioDestinationNode | null;
  isRecordingActive: boolean;
  initializeRecording: () => Promise<void>;
  connectAudioElement: (audio: HTMLAudioElement) => void;
}

const AudioRecordingContext = createContext<AudioRecordingContextType | null>(null);

export function useAudioRecording() {
  const context = useContext(AudioRecordingContext);
  if (!context) {
    throw new Error('useAudioRecording must be used within AudioRecordingProvider');
  }
  return context;
}

interface AudioRecordingProviderProps {
  children: ReactNode;
}

export function AudioRecordingProvider({ children }: AudioRecordingProviderProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const connectedElementsRef = useRef<Set<HTMLAudioElement>>(new Set());

  const initializeRecording = async () => {
    if (audioContextRef.current) {
      return; // Already initialized
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;

      setIsRecordingActive(true);
      console.log('✅ Audio recording context initialized');
    } catch (error) {
      console.error('Failed to initialize recording context:', error);
      throw error;
    }
  };

  const connectAudioElement = (audio: HTMLAudioElement) => {
    if (!audioContextRef.current || !destinationRef.current) {
      return; // Not initialized yet
    }

    // Don't connect same element twice
    if (connectedElementsRef.current.has(audio)) {
      return;
    }

    try {
      const source = audioContextRef.current.createMediaElementSource(audio);
      // Connect to both destination (for recording) and default output (for playback)
      source.connect(destinationRef.current);
      source.connect(audioContextRef.current.destination);
      
      connectedElementsRef.current.add(audio);
      console.log('🎤 Audio element connected to recording');
    } catch {
      // Element might already be connected, which is fine
      console.log('Note: Audio element connection skipped (may already be connected)');
    }
  };

  const value: AudioRecordingContextType = {
    audioContext: audioContextRef.current,
    destination: destinationRef.current,
    isRecordingActive,
    initializeRecording,
    connectAudioElement,
  };

  return (
    <AudioRecordingContext.Provider value={value}>
      {children}
    </AudioRecordingContext.Provider>
  );
}

