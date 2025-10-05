# Chord Progression App

A modern web application that allows songwriters to create and play chord progressions using their keyboard, without needing to learn piano or guitar. Built with Next.js, TypeScript, and AWS Amplify.

## 🎵 Features

- **Real-time Audio Playback**: Uses Web Audio API with Tone.js for responsive chord playback
- **Multiple Key Signatures**: Support for C, G, D, A, and E major keys
- **Popular Chord Progressions**: Includes classic progressions like I-V-vi-IV, vi-IV-I-V, and more
- **Keyboard Mapping**: Map chords to keyboard keys for easy playing
- **AWS Integration**: Hosted on AWS Amplify with authentication and data storage
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Audio**: Tone.js for Web Audio API integration
- **Backend**: AWS Amplify Gen 2 with:
  - Authentication (Cognito)
  - Data Storage (DynamoDB)
  - File Storage (S3)
  - Hosting (Amplify Hosting)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS account with appropriate permissions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Initialize AWS Amplify (Optional)

To use AWS services:

```bash
# Start Amplify sandbox for development
npm run amplify:dev

# Or build once
npm run amplify:build
```

## 🎹 How to Use

1. **Initialize Audio**: Click the "Initialize Audio" button to enable sound
2. **Select Key**: Choose from C, G, D, A, or E major
3. **Choose Progression**: Pick from popular chord progressions
4. **Play Chords**: 
   - Use your physical keyboard keys (A, S, D, F, etc.)
   - Or click the virtual keyboard on screen
5. **Create Music**: Experiment with different keys and progressions

## 🎼 Supported Chord Progressions

- **I-V-vi-IV**: Classic pop (C-G-Am-F)
- **vi-IV-I-V**: Emotional (Am-F-C-G)
- **I-vi-IV-V**: Doo-wop (C-Am-F-G)
- **ii-V-I**: Jazz (Dm-G-C)
- **I-IV-V-I**: Blues (C-F-G-C)

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ChordKeyboard.tsx  # Virtual keyboard component
│   └── ChordSelector.tsx  # Settings component
└── types/                 # TypeScript type definitions
    └── chords.ts          # Chord-related types

amplify/                   # AWS Amplify backend
├── backend.ts            # Main backend definition
├── auth/                 # Authentication configuration
├── storage/              # S3 storage configuration
└── data/                 # DynamoDB data models
```

### Available Scripts

```bash
npm run dev              # Start development server
npm run dev:turbo        # Start with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run amplify:dev      # Start Amplify sandbox
npm run amplify:build    # Build Amplify backend
npm run amplify:deploy   # Deploy to production
```

## 🎵 Audio Features

The app uses Tone.js for high-quality audio synthesis:

- **Polyphonic Synthesis**: Play multiple notes simultaneously
- **Real-time Response**: Low-latency audio playback
- **Piano-like Sound**: Triangle wave synthesis with envelope shaping
- **Cross-browser Compatible**: Works in all modern browsers

## 🔧 Customization

### Adding New Keys

Edit `src/types/chords.ts` to add new key signatures:

```typescript
export type KeySignature = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F';
```

### Adding New Progressions

Add to the `progressions` array in `src/components/ChordSelector.tsx`:

```typescript
{
  value: 'I-vi-ii-V' as ChordProgression,
  name: 'I-vi-ii-V',
  description: 'Your custom progression',
  examples: ['Song 1', 'Song 2'],
}
```

### Customizing Audio

Modify the synthesizer settings in `src/app/page.tsx`:

```typescript
const newSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'sawtooth', // Change wave type
  },
  envelope: {
    attack: 0.1,      // Adjust attack time
    decay: 0.2,       // Adjust decay time
    sustain: 0.5,     // Adjust sustain level
    release: 2.0,     // Adjust release time
  },
});
```

## 🚀 Deployment

### AWS Amplify Hosting

1. **Connect Repository**: Connect your Git repository to AWS Amplify
2. **Configure Build**: Use the default Next.js build settings
3. **Deploy**: Amplify will automatically build and deploy your app

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to your preferred hosting platform
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tone.js** for Web Audio API integration
- **Next.js** for the React framework
- **AWS Amplify** for backend services
- **Tailwind CSS** for styling
- **Music theory community** for chord progression inspiration

---

**Built with ❤️ for songwriters and musicians**