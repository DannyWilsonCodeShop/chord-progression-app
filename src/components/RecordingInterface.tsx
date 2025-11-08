'use client';

interface RecordingInterfaceProps {
  isSubscribed: boolean;
  onUpgrade: () => void;
}

export default function RecordingInterface({ isSubscribed, onUpgrade }: RecordingInterfaceProps) {
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
          {/* Screen Recording Instructions */}
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-5 mb-6">
            <div className="text-blue-300 font-mono text-base font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span>HOW TO RECORD YOUR MUSIC</span>
            </div>
            
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mb-4">
              <div className="text-green-300 text-sm font-bold mb-2">✨ BEST METHOD - Screen Recording:</div>
              <div className="space-y-2 text-xs text-green-200/90">
                <div><strong>iPhone/iPad:</strong> Swipe to Control Center → tap Screen Recording button</div>
                <div><strong>Mac:</strong> Press ⌘+Shift+5 → Record Selected Portion → include audio</div>
                <div><strong>Windows:</strong> Press Win+G → Capture → Record</div>
              </div>
              <div className="mt-2 pt-2 border-t border-green-700/30 text-xs text-green-300/70">
                💡 Screen recording captures perfect quality audio + video of your performance!
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700/40 rounded-lg p-3">
              <div className="text-blue-300 text-sm font-bold mb-2">🎵 Recording Tips:</div>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-200/80">
                <li>Start recording, then play your chord progression</li>
                <li>Make sure system audio is ON and volume is UP</li>
                <li>On iPhone: Check that silent mode switch is OFF</li>
                <li>Recording captures everything you hear from the app</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
