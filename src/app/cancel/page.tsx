'use client';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-gray-600">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-3xl font-bold text-gray-300 font-mono mb-4">
            SUBSCRIPTION CANCELLED
          </h1>
          <p className="text-gray-400 mb-6">
            No worries! You can still use MPC Studio for free. Upgrade anytime to unlock recording and premium features.
          </p>
          <a
            href="/"
            className="bg-green-600 hover:bg-green-700 text-black font-bold py-3 px-6 rounded-lg transition-colors font-mono inline-block"
          >
            BACK TO MPC STUDIO
          </a>
        </div>
      </div>
    </div>
  );
}
