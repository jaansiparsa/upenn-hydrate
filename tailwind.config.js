/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🌊 HYDRATE Water/Fountain Theme Color System
      colors: {
        // Core Water Theme Palette
        hydrate: {
          // Light water tones (inspired by water surface)
          50: '#f0f9ff',    // Lightest water
          100: '#e0f2fe',   // Very light cyan
          200: '#bae6fd',   // Light cyan
          300: '#7dd3fc',   // Medium light cyan
          400: '#38bdf8',   // Bright cyan
          500: '#0ea5e9',   // Primary cyan
          600: '#0284c7',   // Medium cyan
          700: '#0369a1',   // Darker cyan
          800: '#075985',   // Dark cyan
          900: '#0c4a6e',   // Darkest cyan
          950: '#082f49',   // Navy cyan
        },
        
        // Primary Blue Scale (from HYDRATE brand)
        primary: {
          50: '#eff6ff',    // Based on #DBE5FF
          100: '#dbeafe',   // #DBE5FF - lightest HYDRATE blue
          200: '#bfdbfe',   // Between 100 and 300
          300: '#93c5fd',   // #A9BDF1 region
          400: '#60a5fa',   // Between 300 and 500
          500: '#3b82f6',   // #446FE0 - core HYDRATE blue
          600: '#2563eb',   // Slightly darker
          700: '#1d4ed8',   // #0F44CD region
          800: '#1e40af',   // Between 700 and 900
          900: '#1e3a8a',   // #0836AB - dark HYDRATE blue
          950: '#172554',   // #062472 - darkest HYDRATE blue
        },
        
        // Water-themed semantic colors
        water: {
          droplet: '#38bdf8',    // Bright cyan for water drops
          flow: '#0ea5e9',       // Primary water flow color
          fountain: '#0284c7',   // Fountain mechanism color
          deep: '#075985',       // Deep water color
          mist: '#e0f2fe',       // Water mist/spray color
        },
        
        // Glass/Transparency effects
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          heavy: 'rgba(255, 255, 255, 0.3)',
          blue: 'rgba(59, 130, 246, 0.1)',
          cyan: 'rgba(14, 165, 233, 0.1)',
        },
        
        // Updated brand colors to match login page
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',     // Primary brand blue
          600: '#2563eb',     // Hover states
          700: '#1d4ed8',     // Active states
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        
        // Cyan accent colors (for interactive elements)
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',     // Primary accent cyan
          600: '#0891b2',     // Hover accent
          700: '#0e7490',     // Active accent
          800: '#155e75',
          900: '#164e63',
          DEFAULT: '#06b6d4',
        },
      },
      
      // Typography - Modern, clean fonts for water theme
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      
      // Typography scale optimized for water theme
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
        '8xl': ['6rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],
      },
      
      // Water-themed gradients
      backgroundImage: {
        'gradient-water': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #0891b2 0%, #1e40af 100%)',
        'gradient-mist': 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
        'gradient-flow': 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #2563eb 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // Water-themed shadows with blue/cyan tints
      boxShadow: {
        // Subtle water-like shadows
        'water-sm': '0 1px 2px 0 rgb(14 165 233 / 0.1)',
        'water': '0 1px 3px 0 rgb(14 165 233 / 0.1), 0 1px 2px -1px rgb(14 165 233 / 0.1)',
        'water-md': '0 4px 6px -1px rgb(14 165 233 / 0.1), 0 2px 4px -2px rgb(14 165 233 / 0.1)',
        'water-lg': '0 10px 15px -3px rgb(14 165 233 / 0.1), 0 4px 6px -4px rgb(14 165 233 / 0.1)',
        'water-xl': '0 20px 25px -5px rgb(14 165 233 / 0.1), 0 8px 10px -6px rgb(14 165 233 / 0.1)',
        'water-2xl': '0 25px 50px -12px rgb(14 165 233 / 0.25)',
        
        // Glowing water effects
        'glow-water': '0 0 20px rgb(14 165 233 / 0.4)',
        'glow-brand': '0 0 20px rgb(59 130 246 / 0.4)',
        'glow-accent': '0 0 20px rgb(6 182 212 / 0.4)',
        
        // Interactive shadows
        'ripple': '0 0 0 0 rgb(14 165 233 / 0.7)',
        'ripple-active': '0 0 0 10px rgb(14 165 233 / 0)',
      },
      
      // Water-themed animations
      animation: {
        // Basic animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        
        // Water-specific animations
        'water-drop': 'waterDrop 3s ease-in-out infinite',
        'water-flow': 'waterFlow 4s ease-in-out infinite',
        'ripple': 'ripple 2s ease-in-out infinite',
        'fountain': 'fountain 2s ease-in-out infinite',
        'wave': 'wave 6s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        
        // Interactive animations
        'pulse-water': 'pulseWater 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        // Basic keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Water-themed keyframes
        waterDrop: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '0.6',
          },
          '50%': { 
            transform: 'translateY(-10px) scale(1.1)',
            opacity: '0.8',
          },
        },
        waterFlow: {
          '0%, 100%': { 
            transform: 'translateX(0) scaleY(1)',
          },
          '50%': { 
            transform: 'translateX(5px) scaleY(1.05)',
          },
        },
        ripple: {
          '0%': { 
            transform: 'scale(1)',
            opacity: '1',
            boxShadow: '0 0 0 0 rgb(14 165 233 / 0.7)'
          },
          '70%': { 
            transform: 'scale(1.05)',
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgb(14 165 233 / 0)'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1',
            boxShadow: '0 0 0 0 rgb(14 165 233 / 0)'
          },
        },
        fountain: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            opacity: '1',
          },
          '50%': { 
            transform: 'translateY(-8px)',
            opacity: '0.9',
          },
        },
        wave: {
          '0%, 100%': { 
            transform: 'translateY(0)',
          },
          '50%': { 
            transform: 'translateY(-20px)',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-6px)',
          },
        },
        pulseWater: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 0 rgb(14 165 233 / 0.7)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 0 15px rgb(14 165 233 / 0)'
          },
        },
        bounceGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // Spacing scale optimized for clean layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      // Border radius for modern, clean appearance
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      
      // Backdrop blur for glassmorphism effects
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
