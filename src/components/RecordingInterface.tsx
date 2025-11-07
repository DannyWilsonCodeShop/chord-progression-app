'use client';

import { useState, useRef } from 'react';
import * as Tone from 'tone';
// TODO: Uncomment after Amplify deployment
// import { uploadData } from 'aws-amplify/storage';
// import { generateClient } from 'aws-amplify/data';
// import { getCurrentUser } from 'aws-amplify/auth';
// import type { Schema } from '../../../amplify/data/resource';

// const client = generateClient<Schema>();

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
  const [recordingInitialized, setRecordingInitialized] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Initialize audio recording for browser audio capture
  const initializeRecording = async () => {
    try {
      // Create Web Audio API context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create destination for recording stream
      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
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
      console.log('🔴 Recording started');
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
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  // TODO: Uncomment after Amplify deployment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveToCloud = async (blob: Blob, name: string) => {
    // TODO: Implement after Amplify backend is deployed
    console.log('Cloud save not yet configured - Amplify backend required');
    return false;
    
    /* Uncomment after Amplify deployment:
    try {
      const user = await getCurrentUser();
      const userId = user.userId;
      const timestamp = Date.now();
      const s3Key = `recordings/${userId}/${timestamp}-${name}.webm`;

      // Upload to S3
      const uploadResult = await uploadData({
        key: s3Key,
        data: blob,
        options: {
          contentType: 'audio/webm',
        },
      }).result;

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
    */
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

      <div className="text-center py-6 mb-4 bg-blue-900/30 rounded-lg border border-blue-700">
        <div className="text-blue-400 font-mono text-sm mb-2">
          ℹ️ COMING SOON
        </div>
        <p className="text-gray-300 text-xs px-4">
          Full recording with cloud save will be available after backend deployment. For now, use your device&apos;s screen recording feature.
        </p>
      </div>

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
