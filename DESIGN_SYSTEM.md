# 🌊 HYDRATE Design System
*Water/Fountain Themed Design Guide*

## Overview
The HYDRATE design system is built around the concept of water, fountains, and hydration. It emphasizes fluidity, clarity, and refreshing interactions that mirror the experience of clean, flowing water.

---

## 🎨 Color Palette

### Primary Colors (Brand)
Our core brand colors are inspired by clean, refreshing water:

```css
/* Primary Blue Scale */
--brand-50: #eff6ff    /* Lightest brand tint */
--brand-100: #dbeafe   /* Very light brand */
--brand-300: #93c5fd   /* Light brand */
--brand-500: #3b82f6   /* Primary brand color */
--brand-600: #2563eb   /* Hover states */
--brand-700: #1d4ed8   /* Active states */
--brand-900: #1e3a8a   /* Dark brand */
```

**Usage:**
- `bg-brand-500` - Primary buttons, links, highlights
- `bg-brand-600` - Button hover states
- `bg-brand-700` - Active/pressed states
- `text-brand-700` - Primary text links
- `border-brand-300` - Form field borders

### Water Theme Colors
Specialized colors for water-themed elements:

```css
/* Water Semantic Colors */
--water-droplet: #38bdf8  /* Bright cyan for water drops */
--water-flow: #0ea5e9     /* Primary water flow color */
--water-fountain: #0284c7 /* Fountain mechanism color */
--water-deep: #075985     /* Deep water color */
--water-mist: #e0f2fe     /* Water mist/spray color */
```

**Usage:**
- `text-water-droplet` - Water drop icons
- `bg-water-flow` - Flow animations
- `border-water-fountain` - Fountain elements

### Accent Colors (Cyan)
For interactive elements and highlights:

```css
/* Cyan Accent Scale */
--accent-500: #06b6d4    /* Primary accent */
--accent-600: #0891b2    /* Hover accent */
--accent-700: #0e7490    /* Active accent */
```

### Glass/Transparency
For glassmorphism effects:

```css
--glass-light: rgba(255, 255, 255, 0.1)
--glass-medium: rgba(255, 255, 255, 0.2)
--glass-blue: rgba(59, 130, 246, 0.1)
--glass-cyan: rgba(14, 165, 233, 0.1)
```

---

## 🖋️ Typography

### Font Family
- **Primary**: Inter (modern, clean, readable)
- **Display**: Inter (for headings and large text)
- **Monospace**: JetBrains Mono (for code)

### Font Scale
All sizes include optimized line heights and letter spacing:

```css
/* Typography Scale */
text-xs    → 12px / 16px / 0.025em
text-sm    → 14px / 20px / 0.025em
text-base  → 16px / 24px / 0.025em
text-lg    → 18px / 28px / 0.025em
text-xl    → 20px / 28px / 0.025em
text-2xl   → 24px / 32px / 0.025em
text-3xl   → 30px / 36px / 0.025em
text-4xl   → 36px / 40px / 0.025em
```

### Typography Usage
```jsx
// Headings
<h1 className="text-4xl font-bold text-brand-900">Main Title</h1>
<h2 className="text-2xl font-semibold text-brand-700">Section Title</h2>
<h3 className="text-xl font-medium text-brand-600">Subsection</h3>

// Body text
<p className="text-base text-gray-700">Regular paragraph text</p>
<p className="text-sm text-gray-600">Secondary text</p>

// Interactive text
<a className="text-brand-600 hover:text-brand-700 font-medium">Link text</a>
```

---

## 🎭 Gradients

### Water-Themed Gradients
```css
/* Background Gradients */
bg-gradient-water  → linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)
bg-gradient-ocean  → linear-gradient(135deg, #0891b2 0%, #1e40af 100%)
bg-gradient-mist   → linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)
bg-gradient-flow   → linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #2563eb 100%)
```

### Usage Examples
```jsx
// Main backgrounds
<div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">

// Button gradients
<button className="bg-gradient-to-r from-brand-500 to-accent-500">

// Card backgrounds
<div className="bg-gradient-mist">
```

---

## 💫 Shadows & Effects

### Water-Themed Shadows
```css
/* Subtle Shadows */
shadow-water-sm  → subtle water tint
shadow-water     → standard water shadow
shadow-water-lg  → prominent water shadow

/* Glowing Effects */
shadow-glow-water → glowing water effect
shadow-glow-brand → glowing brand effect

/* Interactive Shadows */
shadow-ripple → ripple effect base
```

### Usage
```jsx
// Cards
<div className="shadow-water-lg backdrop-blur-sm bg-white/80">

// Interactive elements
<button className="hover:shadow-glow-brand transition-shadow duration-300">

// Form inputs
<input className="focus:shadow-ripple transition-shadow">
```

---

## 🎬 Animations

### Water-Themed Animations
```css
/* Water Specific */
animate-water-drop  → 3s bouncing water drop
animate-water-flow  → 4s flowing movement
animate-ripple      → 2s ripple effect
animate-fountain    → 2s fountain movement
animate-wave        → 6s wave motion
animate-float       → 3s gentle floating

/* Interactive */
animate-pulse-water → pulsing with water colors
animate-shimmer     → shimmer effect
```

### Usage Examples
```jsx
// Water drops
<div className="animate-water-drop bg-water-droplet rounded-full">

// Interactive elements
<button className="hover:animate-pulse-water">

// Background elements
<div className="animate-wave opacity-10">
```

---

## 🧩 Component Patterns

### Glassmorphism Cards
```jsx
<Card className="backdrop-blur-sm bg-white/80 border-blue-200 shadow-water-xl">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Water-Themed Buttons
```jsx
// Primary Action
<Button className="bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold shadow-water-md hover:shadow-glow-brand transition-all duration-300 hover:scale-105">
  Primary Action
</Button>

// Secondary Action
<Button variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-400">
  Secondary Action
</Button>
```

### Form Inputs with Ripple Effects
```jsx
<div className="relative">
  <Input 
    className="pl-10 border-blue-200 focus:border-accent-400 focus:ring-accent-400 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-water-md"
    onFocus={() => setRipple(true)}
    onBlur={() => setRipple(false)}
  />
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
    <WaterIcon className="h-4 w-4 text-accent-500" />
  </div>
  {ripple && <RippleEffect />}
</div>
```

### Water Drop Backgrounds
```jsx
// Floating water drops
<div className="absolute w-2 h-3 bg-water-droplet rounded-full opacity-60 animate-water-drop" 
     style={{
       left: '10%',
       top: '20%',
       animationDelay: '0s',
       clipPath: 'ellipse(50% 60% at 50% 40%)'
     }} />
```

---

## 🎨 Usage Guidelines

### Do's ✅
- Use water-themed gradients for backgrounds
- Apply glassmorphism effects to overlays
- Include subtle water animations
- Use ripple effects on interactive elements
- Maintain consistent blue/cyan color palette
- Apply gentle, flowing transitions

### Don'ts ❌
- Don't use harsh, angular transitions
- Avoid red or warm colors for primary elements
- Don't overuse animations (keep them subtle)
- Avoid heavy shadows that break the light, airy feel
- Don't mix multiple gradient directions in one component

---

## 📱 Responsive Considerations

### Breakpoint Strategy
```css
/* Mobile First Approach */
sm: 640px   → Small tablets
md: 768px   → Tablets
lg: 1024px  → Small desktops
xl: 1280px  → Large desktops
2xl: 1536px → Extra large screens
```

### Mobile Optimizations
- Reduce animation complexity on mobile
- Use larger touch targets (min 44px)
- Simplify gradients for better performance
- Consider reduced motion preferences

---

## 🚀 Implementation Examples

### Login Page Water Theme
```jsx
// Background with waves and drops
<div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
  
  {/* Animated wave background */}
  <div className="absolute inset-0 opacity-10">
    <svg className="w-full h-full animate-wave">
      {/* Wave paths */}
    </svg>
  </div>
  
  {/* Floating water drops */}
  {waterDrops.map((drop, i) => (
    <WaterDrop key={i} {...drop} />
  ))}
  
  {/* Glassmorphism card */}
  <Card className="backdrop-blur-sm bg-white/80 border-blue-200 shadow-water-2xl">
    {/* Content */}
  </Card>
</div>
```

### Interactive Form Elements
```jsx
<div className="space-y-4">
  <div className="relative group">
    <label className="block text-sm font-medium text-blue-800 mb-1">
      Email Address
    </label>
    <Input 
      className="pl-10 border-blue-200 focus:border-accent-400 focus:ring-accent-400 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-water-md"
      placeholder="your.email@penn.edu"
    />
    <Waves className="absolute left-3 top-8 h-4 w-4 text-accent-500" />
  </div>
</div>
```

---

## 🎯 Accessibility

### Color Contrast
- All text maintains WCAG AA contrast ratios
- Interactive elements have clear focus states
- Color is never the only indicator of state

### Motion
- Respect `prefers-reduced-motion`
- Provide alternatives to motion-based interactions
- Keep animations subtle and non-distracting

### Touch Targets
- Minimum 44px touch targets on mobile
- Clear hover and focus states
- Adequate spacing between interactive elements

---

This design system creates a cohesive, water-themed experience that's both beautiful and functional. The combination of blues, cyans, flowing animations, and glassmorphism effects creates the perfect aesthetic for the HYDRATE fountain-finding app.
