'use client';

import { useState, useRef } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import { useAudioRecording } from '@/contexts/AudioRecordingContext';

const client = generateClient<Schema>();

interface RecordingInterfaceProps {
  isSubscribed: boolean;
  onUpgrade: () => void;
}

export default function RecordingInterface({ isSubscribed, onUpgrade }: RecordingInterfaceProps) {
  const { destination, initializeRecording: initAudioContext } = useAudioRecording();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordings, setRecordings] = useState<Array<{name: string, url: string, date: Date}>>([]);
  const [recordingInitialized, setRecordingInitialized] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio recording for browser audio capture
  const initializeRecording = async () => {
    try {
      console.log('🔧 Initializing recording system...');
      
      // Initialize the shared audio context
      await initAudioContext();

      console.log('🔍 Checking audio destination...', { destinationExists: !!destination });

      if (!destination) {
        console.error('❌ Audio destination not available after initialization!');
        throw new Error('Audio destination not available - try clicking INIT again');
      }

      console.log('✅ Audio destination ready, creating MediaRecorder...');

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      console.log('🎙️ Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('📦 Audio chunk received:', event.data.size, 'bytes. Total chunks:', chunks.length);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        console.log('🎙️ Recording stopped - Blob size:', blob.size, 'bytes');
        
        if (blob.size < 1000) {
          console.warn('⚠️ Recording is very small - might be empty!');
          alert('Warning: Recording appears to be empty. Make sure you played sounds WHILE recording was active.');
        }
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        const recordingName = `Recording ${recordings.length + 1}`;
        
        // Save to cloud if subscribed
        if (isSubscribed) {
          const saved = await saveToCloud(blob, recordingName);
          if (saved) {
            console.log('Recording saved to cloud successfully');
          }
        }
        
        // Save recording to local list
        const newRecording = {
          name: recordingName,
          url,
          date: new Date()
        };
        setRecordings(prev => [...prev, newRecording]);
        chunks.length = 0; // Clear chunks
      };

      setRecordingInitialized(true);
      console.log('✅ Recording initialized');
    } catch (error) {
      console.error('Failed to initialize recording:', error);
      alert('Recording initialization failed. Please check your browser permissions.');
    }
  };

  const startRecording = () => {
    if (!recordingInitialized) {
      alert('Please click INIT button first to initialize recording');
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      console.log('🔴 Recording started - Play sounds now and they will be captured!');
      console.log('🎤 Note: Only sounds played AFTER clicking INIT will be recorded');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('⏹️ Recording stopped');
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      console.log('▶️ Playing recording:', audioUrl);
      if (audioRef.current) {
        console.log('🔊 Audio element exists, attempting playback...');
        audioRef.current.play()
          .then(() => {
            console.log('✅ Playback started successfully');
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('❌ Playback failed:', err);
            alert('Playback failed. The recording might be empty or corrupted.');
          });
        
        audioRef.current.onended = () => {
          console.log('⏹️ Playback ended');
          setIsPlaying(false);
        };
      } else {
        console.error('❌ Audio element not found!');
      }
    } else {
      console.warn('⚠️ No audio URL available to play');
    }
  };

  const saveToCloud = async (blob: Blob, name: string) => {
    try {
      const user = await getCurrentUser();
      const userId = user.userId;
      const timestamp = Date.now();
      // Use public path instead of identity-based path for now
      const s3Key = `public/recordings/${timestamp}-${name}.webm`;

      console.log('☁️ Uploading to S3:', { userId, s3Key, blobSize: blob.size });

      // Upload to S3
      const uploadResult = await uploadData({
        path: s3Key,
        data: blob,
        options: {
          contentType: 'audio/webm',
        },
      }).result;

      console.log('✅ Upload successful:', uploadResult);

      // Save metadata to database
      await client.models.Recording.create({
        userId,
        fileName: `${name}.webm`,
        s3Key,
        duration: 0,
        fileSize: blob.size,
      });

      console.log('Recording saved to cloud:', uploadResult);
      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return false;
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
            Cloud recording will be available for MPC Studio Pro subscribers
          </p>
          <button
            onClick={onUpgrade}
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 px-6 rounded-lg transition-colors font-mono"
          >
            UPGRADE TO PRO - $9.99/MONTH
          </button>
        </div>
      ) : (
        <>
          {/* Step-by-Step Instructions */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
            <div className="text-blue-400 font-mono text-sm font-bold mb-3">
              📋 HOW TO RECORD
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>
                  <strong className="text-white">Click 🔧 INIT once</strong> - Sets up recording (like &quot;TAP TO ENABLE AUDIO&quot;, only needed once)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>
                  <strong className="text-white">Click ⏺️ REC</strong> - Starts recording
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>
                  <strong className="text-white">Play your chords/bass</strong> - Everything you hear will be recorded
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>
                  <strong className="text-white">Click ⏹️ STOP</strong> - Saves your recording
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">5.</span>
                <span>
                  <strong className="text-white">Click ▶️ to playback</strong> or use the audio player below
                </span>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`py-2 px-3 rounded-lg font-mono text-sm font-bold transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-black'
              }`}
            >
              {isRecording ? '⏹️ STOP' : '⏺️ REC'}
            </button>

            <button
              onClick={playRecording}
              disabled={!audioUrl}
              className={`py-2 px-3 rounded-lg font-mono text-sm font-bold transition-colors ${
                audioUrl
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={initializeRecording}
              disabled={recordingInitialized}
              className={`py-2 px-3 rounded-lg font-mono text-sm font-bold transition-colors ${
                recordingInitialized
                  ? 'bg-green-700 text-green-300 cursor-default'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {recordingInitialized ? '✓ READY' : '🔧 INIT'}
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
              <div className={`inline-block px-4 py-2 rounded-lg font-mono text-sm ${
                !recordingInitialized
                  ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                  : isRecording 
                  ? 'bg-red-900 text-red-300 border border-red-700 animate-pulse' 
                  : audioUrl
                  ? 'bg-green-900 text-green-300 border border-green-700'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {!recordingInitialized
                  ? '⚠️ Step 1: Click INIT to begin'
                  : isRecording 
                  ? '🔴 RECORDING... (Step 3: Play music now!)'
                  : audioUrl
                  ? '✅ Recording saved! (Step 5: Click ▶️ to play)'
                  : '⭕ READY - Step 2: Click REC when ready'}
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
                    className="bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-mono text-sm truncate">{recording.name}</div>
                        <div className="text-gray-400 text-xs">
                          {recording.date.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAudioUrl(recording.url)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded font-mono text-xs"
                      >
                        ▶️
                      </button>
                      <button
                        onClick={() => downloadRecording(recording)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded font-mono text-xs"
                      >
                        💾
                      </button>
                      <button
                        onClick={() => deleteRecording(index)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded font-mono text-xs"
                      >
                        🗑️
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
