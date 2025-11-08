'use client';

import { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import { useRecording } from '@/contexts/RecordingContext';

const client = generateClient<Schema>();

interface RecordingInterfaceProps {
  isSubscribed: boolean;
  onUpgrade: () => void;
}

export default function RecordingInterface({ isSubscribed, onUpgrade }: RecordingInterfaceProps) {
  const { isRecordingMode, isRecording, recordedBlob, startRecordingMode, startRecording, stopRecording, exitRecordingMode, clearRecording } = useRecording();
  
  const [recordings, setRecordings] = useState<Array<{name: string, url: string, blob: Blob, date: Date}>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');

  const handleStartRecordingMode = async () => {
    try {
      await startRecordingMode();
      alert('Recording mode activated! The app will now use Tone.js for audio (works with recording). Play sounds normally and they will be captured.');
    } catch (error) {
      alert('Failed to start recording mode. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob && blob.size > 1000) {
      const recordingName = `Recording ${recordings.length + 1}`;
      const url = URL.createObjectURL(blob);
      
      // Save to cloud
      if (isSubscribed) {
        await saveToCloud(blob, recordingName);
      }
      
      // Save to local list
      setRecordings(prev => [...prev, {
        name: recordingName,
        url,
        blob,
        date: new Date()
      }]);
      
      alert('Recording saved! You can now playback or download it.');
    } else if (blob) {
      alert('Recording is empty. Make sure to play sounds WHILE recording is active.');
    }
  };

  const playRecording = (url: string) => {
    const audio = new Audio(url);
    audio.play();
    setIsPlaying(true);
    setCurrentAudioUrl(url);
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudioUrl('');
    };
  };

  const downloadRecording = (recording: {name: string, blob: Blob}) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(recording.blob);
    link.download = `${recording.name}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteRecording = (index: number) => {
    setRecordings(prev => prev.filter((_, i) => i !== index));
    if (recordings[index].url === currentAudioUrl) {
      setCurrentAudioUrl('');
      setIsPlaying(false);
    }
  };

  const saveToCloud = async (blob: Blob, name: string) => {
    try {
      const user = await getCurrentUser();
      const userId = user.userId;
      const timestamp = Date.now();
      const s3Key = `public/recordings/${timestamp}-${name}.webm`;

      await uploadData({
        path: s3Key,
        data: blob,
        options: {
          contentType: 'audio/webm',
        },
      }).result;

      await client.models.Recording.create({
        userId,
        fileName: `${name}.webm`,
        s3Key,
        duration: 0,
        fileSize: blob.size,
      });

      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return false;
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
            UPGRADE TO PRO - $9.99/MONTH
          </button>
        </div>
      ) : (
        <>
          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
            <div className="text-blue-400 font-mono text-sm font-bold mb-3">
              📋 HOW TO RECORD
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>1.</strong> Click ENABLE RECORDING MODE</div>
              <div><strong>2.</strong> Click START REC button</div>
              <div><strong>3.</strong> Play your chord progression</div>
              <div><strong>4.</strong> Click STOP REC to save</div>
              <div><strong>5.</strong> Playback, download, or share!</div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700/50 text-yellow-300 text-xs">
              💡 Recording mode uses Tone.js for audio capture. Sounds may be slightly different but recording works perfectly!
            </div>
          </div>

          {/* Recording Controls */}
          {!isRecordingMode ? (
            <div className="text-center py-6">
              <button
                onClick={handleStartRecordingMode}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors font-mono"
              >
                🎙️ ENABLE RECORDING MODE
              </button>
              <p className="text-gray-400 text-xs mt-3">
                This switches audio to Tone.js for proper recording
              </p>
            </div>
          ) : (
            <div>
              {/* Recording Status */}
              <div className="text-center mb-4">
                <div className={`inline-block px-4 py-2 rounded-lg font-mono text-sm border ${
                  isRecording 
                    ? 'bg-red-900 text-red-300 border-red-700 animate-pulse' 
                    : recordedBlob
                    ? 'bg-green-900 text-green-300 border-green-700'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {isRecording 
                    ? '🔴 RECORDING... Play sounds now!' 
                    : recordedBlob
                    ? '✅ Recording saved!'
                    : '⭕ Ready to record'}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {!isRecording && !recordedBlob && (
                  <button
                    onClick={startRecording}
                    className="col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors font-mono"
                  >
                    ⏺️ START REC
                  </button>
                )}
                
                {isRecording && (
                  <button
                    onClick={handleStopRecording}
                    className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors font-mono"
                  >
                    ⏹️ STOP REC
                  </button>
                )}

                {recordedBlob && (
                  <>
                    <button
                      onClick={() => {
                        clearRecording();
                        startRecording();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors font-mono text-sm"
                    >
                      🔄 NEW REC
                    </button>
                    <button
                      onClick={() => playRecording(URL.createObjectURL(recordedBlob))}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors font-mono text-sm"
                    >
                      ▶️ PLAY
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={exitRecordingMode}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-mono text-xs mb-4"
              >
                🚪 EXIT RECORDING MODE
              </button>
            </div>
          )}

          {/* Recordings List */}
          {recordings.length > 0 && (
            <div className="mt-6">
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
                          {recording.date.toLocaleTimeString()} • {(recording.blob.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playRecording(recording.url)}
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
