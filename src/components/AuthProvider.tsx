'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

// Check if we're in dev mode (for local testing without Amplify)
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';

// Only configure Amplify in production
if (!isDev) {
  Amplify.configure(outputs);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // In dev mode, skip authentication entirely
  if (isDev) {
    return (
      <div>
        <div className="bg-yellow-900/50 p-3 border-b border-yellow-700">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-yellow-300 font-mono text-xs">
              ⚠️ DEV MODE: Authentication disabled - All features unlocked for testing
            </span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Production mode with Amplify authentication
  return (
    <Authenticator
      formFields={{
        signUp: {
          email: {
            order: 1,
            isRequired: true,
          },
          password: {
            order: 2,
            isRequired: true,
          },
          confirm_password: {
            order: 3,
            isRequired: true,
          },
        },
      }}
      components={{
        Header() {
          return (
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold text-green-400 font-mono">
                MPC STUDIO
              </h1>
              <p className="text-gray-400 mt-2">
                Sign in to access your music production studio
              </p>
            </div>
          );
        },
      }}
    >
      {({ signOut, user }) => (
        <div>
          {user && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <span className="text-green-400 font-mono text-sm">
                  ✅ Signed in as: {user.signInDetails?.loginId}
                </span>
                <button
                  onClick={signOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </Authenticator>
  );
}
