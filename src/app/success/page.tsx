'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with your backend
      fetch('/api/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Update subscription status
            localStorage.setItem('isSubscribed', 'true');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error verifying session:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl">Processing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-green-500">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-400 font-mono mb-4">
            SUBSCRIPTION SUCCESSFUL!
          </h1>
          <p className="text-gray-300 mb-6">
            Welcome to MPC Studio Pro! You now have access to all premium features including recording and cloud storage.
          </p>
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 px-6 rounded-lg transition-colors font-mono inline-block"
          >
            START CREATING MUSIC
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center"><div className="text-green-400 font-mono text-xl">Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
