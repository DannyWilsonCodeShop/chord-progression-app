import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="text-green-400 hover:text-green-300 font-mono transition-colors inline-flex items-center"
          >
            ← Back to MPC Studio
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-green-400 mb-4 font-mono tracking-wider">
            ABOUT THE CREATOR
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-green-400 to-purple-600 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-4 border-gray-800 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Headshot */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-purple-600 rounded-2xl blur-2xl opacity-30"></div>
                <div className="relative rounded-2xl overflow-hidden border-4 border-gray-700 shadow-2xl">
                  <Image
                    src="/images/E00BC28C-A5FB-4CE0-832C-99418AB91137_1_105_c.jpeg"
                    alt="Danny Wilson - Creator"
                    width={400}
                    height={400}
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6 text-gray-300">
              <h2 className="text-4xl font-bold text-white mb-6">Danny Wilson</h2>
              
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Welcome! I&apos;m <span className="text-green-400 font-semibold">Danny Wilson</span>, 
                  a passionate music technologist and developer who believes in making music 
                  creation accessible to everyone.
                </p>

                <p>
                  As the creator of <span className="text-green-400 font-mono">MPC Studio</span>, 
                  I&apos;ve combined my love for music production with cutting-edge web technology 
                  to bring professional-grade chord progression tools right to your browser.
                </p>

                <p>
                  This app was born from countless late-night studio sessions where I wished 
                  I could quickly sketch out chord progressions without reaching for hardware. 
                  Now, with just your keyboard, you can play, experiment, and create music 
                  anywhere, anytime.
                </p>

                <p>
                  Through <span className="text-purple-400 font-semibold">Atlanta Creative Exchange</span>, 
                  I&apos;m dedicated to building tools that empower musicians, producers, and 
                  creatives to bring their ideas to life.
                </p>

                <div className="pt-6 border-t border-gray-700 mt-8">
                  <h3 className="text-2xl font-bold text-green-400 mb-4 font-mono">
                    THE VISION
                  </h3>
                  <p>
                    My mission is simple: democratize music production by creating intuitive, 
                    powerful tools that remove barriers between inspiration and creation. 
                    Whether you&apos;re a seasoned producer or just starting your musical journey, 
                    MPC Studio is here to help you make music your way.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-8">
                <Link
                  href="/"
                  className="inline-block bg-gradient-to-r from-green-600 to-green-500 text-black font-bold px-8 py-4 rounded-lg hover:from-green-500 hover:to-green-400 transition-all font-mono tracking-wider shadow-lg hover:shadow-green-500/50"
                >
                  START CREATING →
                </Link>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-16 pt-12 border-t border-gray-700">
            <h3 className="text-3xl font-bold text-center text-green-400 mb-8 font-mono">
              WHAT MAKES MPC STUDIO SPECIAL
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <div className="text-4xl mb-4">🎹</div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">REAL SOUNDS</h4>
                <p className="text-gray-400">
                  Professional-quality piano, electric piano, and bass samples for authentic sound
                </p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <div className="text-4xl mb-4">⌨️</div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">KEYBOARD CONTROL</h4>
                <p className="text-gray-400">
                  Play instantly with your keyboard - no MIDI controller needed
                </p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <div className="text-4xl mb-4">🎵</div>
                <h4 className="text-xl font-bold text-white mb-2 font-mono">MUSIC THEORY</h4>
                <p className="text-gray-400">
                  Built-in chord progressions based on real music theory
                </p>
              </div>
            </div>
          </div>

          {/* Atlanta Creative Exchange Logo Section */}
          <div className="mt-16 pt-12 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-4">BROUGHT TO YOU BY</p>
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <Image
                  src="/images/6650DCC9-303A-4BC0-A852-FD67BD372CF4_1_102_o.jpeg"
                  alt="Atlanta Creative Exchange"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4 font-mono">
              © 2025 Atlanta Creative Exchange. Built with ❤️ in Atlanta.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

