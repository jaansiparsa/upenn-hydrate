import React from 'react';
import { ArrowRight, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Water Drop Component (matching login page)
const WaterDrop = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
  <div
    className="absolute w-2 h-3 bg-water-droplet rounded-full opacity-60 animate-water-drop"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      clipPath: 'ellipse(50% 60% at 50% 40%)',
    }}
  />
);

export const FrontPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleContactUs = () => {
    navigate('/login');
  };
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hydrate-50 via-primary-50 to-hydrate-100 overflow-hidden relative">
      {/* HYDRATE Title - Updated with design system colors */}
      <div className="absolute top-8 left-8 z-20">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider">
          <span className="text-primary-100">H</span>
          <span className="text-primary-200">Y</span>
          <span className="text-primary-300">D</span>
          <span className="text-primary-500">R</span>
          <span className="text-primary-700">A</span>
          <span className="text-primary-800">T</span>
          <span className="text-primary-950">E</span>
        </h1>
      </div>

      {/* Contact Us Button - Updated with water theme */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={handleContactUs}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 duration-300 hover:shadow hover:scale-105"
        >
          <Droplets className="h-4 w-4" />
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Wave Layers */}
      <div className="absolute inset-0">
        {/* Wave 1 - Darkest with animation */}
        <div className="absolute inset-0 opacity-90">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full animate-wave"
            preserveAspectRatio="xMidYMid slice"
            style={{ animationDuration: '8s', animationDelay: '0s' }}
          >
            <path
              d="M0,300 C300,30 500,450 800,400 C900,380 1000,420 1200,400 L1200,800 L0,800 Z"
              fill="url(#gradient1)"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wave 2 - Medium Dark with animation */}
        <div className="absolute inset-0 opacity-80">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full animate-wave"
            preserveAspectRatio="xMidYMid slice"
            style={{ animationDuration: '10s', animationDelay: '1s' }}
          >
            <path
              d="M0,350 C200,400 400,500 600,450 C800,400 1000,480 1200,450 L1200,800 L0,800 Z"
              fill="url(#gradient2)"
            />
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wave 3 - Medium Light with animation */}
        <div className="absolute inset-0 opacity-70">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full animate-wave"
            preserveAspectRatio="xMidYMid slice"
            style={{ animationDuration: '12s', animationDelay: '2s' }}
          >
            <path
              d="M0,500 C250,450 450,550 700,500 C850,470 950,520 1200,500 L1200,800 L0,800 Z"
              fill="url(#gradient3)"
            />
            <defs>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wave 4 - Lightest with animation */}
        <div className="absolute inset-0 opacity-60">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full animate-wave"
            preserveAspectRatio="xMidYMid slice"
            style={{ animationDuration: '14s', animationDelay: '3s' }}
          >
            <path
              d="M0,550 C300,500 500,600 800,550 C900,530 1000,570 1200,550 L1200,800 L0,800 Z"
              fill="url(#gradient4)"
            />
            <defs>
              <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Floating Water Drops (matching login page) */}
      <WaterDrop delay={0} duration={4} x={15} y={25} />
      <WaterDrop delay={1.5} duration={5} x={85} y={20} />
      <WaterDrop delay={3} duration={4.5} x={20} y={75} />
      <WaterDrop delay={0.5} duration={3.8} x={90} y={65} />
      <WaterDrop delay={2.2} duration={4.2} x={75} y={35} />
      <WaterDrop delay={1} duration={3.5} x={25} y={50} />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-start min-h-screen pl-8 md:pl-16">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            LET'S SIP<br />
            SOME WATER
          </h2>
          <p className="text-lg md:text-xl text-hydrate-100 mb-8 leading-relaxed drop-shadow-md">
            Re-imagining the water fountain experience at Penn
          </p>
          
          {/* Enhanced CTA Button */}
          <button
            onClick={handleGetStarted}
            className="bg-white/90 backdrop-blur-sm text-brand-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:shadow-glow-water transition-all duration-300 hover:scale-105 group border border-white/20"
          >
            <div className="flex items-center">
              <Droplets className="mr-2 h-5 w-5 text-accent-500" />
              Get Started
              <ArrowRight className="inline ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform text-accent-600" />
            </div>
          </button>
        </div>
      </div>


      {/* Subtle gradient overlays for depth */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-hydrate-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-radial from-accent-200/10 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
