'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser, signOut, AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOutUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  showAuthModal: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOutUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function OptionalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing user on mount
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Listen for auth events
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          setShowAuthModal(false);
          break;
        case 'signedOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
      }
    });

    return unsubscribe;
  }, [checkUser]);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  
  const signOutUser = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    signOutUser,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl">Loading MPC Studio...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border-2 border-green-400 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-400 font-mono">
                  SIGN IN TO CONTINUE
                </h2>
                <button
                  onClick={closeAuthModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="text-gray-300 mb-6">
                <p className="mb-4">Sign in or create an account to access premium features:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>🎵 Record your chord progressions</li>
                  <li>💾 Save and download recordings</li>
                  <li>☁️ Cloud storage for your tracks</li>
                  <li>🎛️ Advanced audio effects</li>
                </ul>
              </div>

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
                    return null; // We have our own header
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}