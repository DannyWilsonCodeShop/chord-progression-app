'use client';

import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface RecordingInterfaceProps {
  isSubscribed: boolean;
  onUpgrade: () => void;
}

export default function RecordingInterface({ isSubscribed, onUpgrade }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordings, setRecordings] = useState<Array<{name: string, url: string, date: Date}>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio recording
  const initializeRecording = async () => {
    if (!isSubscribed) {
      onUpgrade();
      return;
    }

    try {
      // Create audio context from Tone.js master output
      const destination = Tone.getDestination();
      const audioContext = destination.context;
      audioContextRef.current = audioContext;

      // Create media stream from audio context
      const source = audioContext.createMediaStreamDestination();
      const gainNode = audioContext.createGain();
      
      // Connect Tone.js output to our recording destination
      destination.connect(gainNode);
      gainNode.connect(source);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(source.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Save recording to list
        const newRecording = {
          name: `Recording ${recordings.length + 1}`,
          url,
          date: new Date()
        };
        setRecordings(prev => [...prev, newRecording]);
      };

    } catch (error) {
      console.error('Failed to initialize recording:', error);
      alert('Recording initialization failed. Please check your browser permissions.');
    }
  };

  const startRecording = () => {
    if (!isSubscribed) {
      onUpgrade();
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      setRecordedChunks([]);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  const downloadRecording = (recording: {name: string, url: string}) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteRecording = (index: number) => {
    const newRecordings = recordings.filter((_, i) => i !== index);
    setRecordings(newRecordings);
    
    if (audioUrl && recordings[index].url === audioUrl) {
      setAudioUrl('');
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-700">
      <h3 className="text-xl font-semibold mb-6 text-green-400 font-mono tracking-wider">
        RECORDING STUDIO
      </h3>

      {!isSubscribed ? (
        <div className="text-center py-8">
          <div className="text-yellow-400 font-mono text-lg mb-4">
            🔒 PREMIUM FEATURE
          </div>
          <p className="text-gray-300 mb-6">
            Recording is available for MPC Studio Pro subscribers
          </p>
          <button
            onClick={onUpgrade}
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 px-6 rounded-lg transition-colors font-mono"
          >
            UPGRADE TO PRO - $3.99/MONTH
          </button>
        </div>
      ) : (
        <>
          {/* Recording Controls */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`py-3 px-4 rounded-lg font-mono font-bold transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-black'
              }`}
            >
              {isRecording ? '⏹️ STOP' : '⏺️ RECORD'}
            </button>

            <button
              onClick={playRecording}
              disabled={!audioUrl}
              className={`py-3 px-4 rounded-lg font-mono font-bold transition-colors ${
                audioUrl
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}
            </button>

            <button
              onClick={initializeRecording}
              className="py-3 px-4 rounded-lg font-mono font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              🔧 INIT
            </button>
          </div>

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full mb-6"
            />
          )}

          {/* Recording Status */}
          <div className="mb-6">
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-lg font-mono ${
                isRecording 
                  ? 'bg-red-900 text-red-300' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {isRecording ? '🔴 RECORDING...' : '⭕ READY'}
              </div>
            </div>
          </div>

          {/* Recordings List */}
          {recordings.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400 font-mono">
                YOUR RECORDINGS
              </h4>
              <div className="space-y-2">
                {recordings.map((recording, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-mono">{recording.name}</div>
                      <div className="text-gray-400 text-sm">
                        {recording.date.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAudioUrl(recording.url)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-mono text-sm"
                      >
                        PLAY
                      </button>
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-mono text-sm"
                      >
                        DOWNLOAD
                      </button>
                      <button
                        onClick={() => deleteRecording(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-mono text-sm"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
