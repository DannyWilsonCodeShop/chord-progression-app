'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import * as Tone from 'tone';

interface RecordingContextType {
  isRecordingMode: boolean;
  isRecording: boolean;
  recordedBlob: Blob | null;
  startRecordingMode: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  exitRecordingMode: () => void;
  clearRecording: () => void;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function useRecording() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within RecordingProvider');
  }
  return context;
}

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<Tone.Recorder | null>(null);

  const startRecordingMode = async () => {
    try {
      // Start Tone.js if not already started
      await Tone.start();
      
      // Create Tone.Recorder connected to master output
      const recorder = new Tone.Recorder();
      Tone.getDestination().connect(recorder);
      recorderRef.current = recorder;
      
      setIsRecordingMode(true);
      console.log('✅ Recording mode enabled - Use Tone.js for audio');
    } catch (error) {
      console.error('Failed to start recording mode:', error);
      throw error;
    }
  };

  const startRecording = () => {
    if (recorderRef.current && !isRecording) {
      recorderRef.current.start();
      setIsRecording(true);
      console.log('🔴 Recording started');
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    if (recorderRef.current && isRecording) {
      const blob = await recorderRef.current.stop();
      setIsRecording(false);
      setRecordedBlob(blob);
      console.log('⏹️ Recording stopped - Blob size:', blob.size);
      return blob;
    }
    return null;
  };

  const exitRecordingMode = () => {
    if (recorderRef.current) {
      recorderRef.current.dispose();
      recorderRef.current = null;
    }
    setIsRecordingMode(false);
    setIsRecording(false);
    console.log('🚪 Exited recording mode - Back to HTML5 Audio');
  };

  const clearRecording = () => {
    setRecordedBlob(null);
  };

  const value: RecordingContextType = {
    isRecordingMode,
    isRecording,
    recordedBlob,
    startRecordingMode,
    startRecording,
    stopRecording,
    exitRecordingMode,
    clearRecording,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

