# Hydrate - React + TypeScript + Supabase Web App

A modern web application built with React, TypeScript, and Supabase for authentication and backend services.

## Features

- 🔐 **Authentication**: Complete sign-up and sign-in functionality with Supabase Auth
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile-First**: Responsive design that works on all devices
- ⚡ **Fast Development**: Built with Vite for lightning-fast development
- 🔒 **Type Safety**: Full TypeScript support for better development experience

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Supabase (Authentication + Database)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- A Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd hydrate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API
   - Copy your Project URL and anon/public key

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthForm.tsx    # Authentication form
│   └── Dashboard.tsx   # Main dashboard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client
├── config/             # Configuration files
│   └── supabase.ts     # Supabase configuration
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Sign Up**: Users can create new accounts with email and password
2. **Email Verification**: Supabase sends verification emails (if enabled)
3. **Sign In**: Users can sign in with their credentials
4. **Protected Routes**: Authenticated users see the dashboard
5. **Sign Out**: Users can sign out from their account

## Customization

### Adding New Features

1. Create new components in `src/components/`
2. Add new contexts in `src/contexts/` if needed
3. Update the dashboard to include your features
4. Add new Supabase tables and update the client as needed

### Styling

The app uses Tailwind CSS for styling. You can:

- Modify the color scheme in `tailwind.config.js`
- Add custom styles in `src/index.css`
- Use Tailwind utility classes throughout components

### Supabase Integration

To add more Supabase features:

1. Update `src/lib/supabase.ts` with new client methods
2. Add new database tables in your Supabase dashboard
3. Create TypeScript types for your data models
4. Implement CRUD operations in your components

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports static sites:

- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have any questions or need help, please:

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [React documentation](https://react.dev)
- Open an issue in this repository
