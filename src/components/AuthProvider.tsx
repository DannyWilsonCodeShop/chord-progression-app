// TODO: Uncomment after Amplify backend deployment
// This component provides authentication UI
// Requires amplify_outputs.json to be generated first

'use client';

// import { Authenticator } from '@aws-amplify/ui-react';
// import '@aws-amplify/ui-react/styles.css';
// import { Amplify } from 'aws-amplify';
// import outputs from '../amplifyconfiguration.json';

// Amplify.configure(outputs);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Temporary: Return children without auth wrapper
  return <>{children}</>;
  
  /* Uncomment after Amplify deployment:
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
      {children}
    </Authenticator>
  );
  */
}

