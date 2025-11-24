# Photolelo - AI-Powered Photo Matching SaaS

A production-ready frontend for a photo-sharing platform with face matching capabilities. Photolelo allows photographers to upload event photos and guests to find their photos instantly using AI face recognition.

## 🚀 Features

- **AI Face Matching**: Upload a selfie to find all your photos from any event
- **Photographer Dashboard**: Manage events, upload photos, and generate guest access links
- **Real-time Updates**: Socket.IO integration for live matching progress
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices
- **Secure Authentication**: JWT-based auth with token refresh
- **File Upload**: Drag & drop interface with camera capture support
- **Photo Management**: Bulk operations, lazy loading, and download capabilities

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Modern UI development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Socket.IO Client** - Real-time communication
- **Shadcn/UI** - Accessible component library
- **Zustand** - State management

## 📦 Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd photolelo-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:3001
# VITE_SOCKET_URL=http://localhost:3001

# Start development server
npm run dev
```

## 🏃 Available Scripts

```bash
# Development
npm run dev          # Start dev server on http://localhost:8080

# Build
npm run build        # Create production build
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint
```

## 🎨 Design System

Photolelo uses a carefully crafted design system with the following color palette:

- **Primary**: `#0d1321` - Deep navy for backgrounds
- **Accent 1**: `#1d2d44` - Secondary surfaces
- **Accent 2**: `#3e5c76` - Interactive elements start
- **Accent 3**: `#748cab` - Interactive elements end
- **Cream**: `#f0ebd8` - Light mode backgrounds and accents

All colors are defined as HSL values in `src/index.css` and available as semantic tokens throughout the app.

## 📡 API Integration

The frontend expects the following backend endpoints:

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Sign in
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Sign out

### Events & Photos
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/:eventId/photos` - Get event photos
- `POST /events/:eventId/upload` - Upload photos
- `DELETE /photos/:photoId` - Delete photo
- `GET /photos/:photoId/download` - Download photo

### Face Matching
- `POST /match` - Submit selfie for matching
- `GET /match/:requestId` - Poll for match results

### Real-time Events (Socket.IO)
- `match_request` - Client initiates matching
- `match_progress` - Server sends progress updates
- `match_result` - Server sends final matches

## 🔧 Configuration

### API Base URL
Update `VITE_API_URL` in `.env` to point to your backend:

```env
VITE_API_URL=https://api.yourbackend.com
VITE_SOCKET_URL=https://api.yourbackend.com
```

### Customizing Endpoints
All API calls are made through `src/api/apiClient.ts`. Update endpoint paths there if your backend uses different routes.

### Matching Flow
The face matching flow is handled in `src/pages/GuestMatch.tsx`. It uses Socket.IO for real-time updates with a fallback to polling if websockets are unavailable.

## 📁 Project Structure

```
src/
├── api/              # API client configuration
├── components/       # Reusable UI components
│   ├── ui/          # Shadcn base components
│   ├── Header.tsx
│   ├── FileUploader.tsx
│   ├── PhotoGrid.tsx
│   └── MatchResult.tsx
├── contexts/        # React Context providers
│   └── AuthContext.tsx
├── hooks/           # Custom React hooks
│   ├── useSocket.ts
│   └── useTheme.ts
├── pages/           # Page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── EventDetail.tsx
│   ├── GuestMatch.tsx
│   └── Settings.tsx
├── lib/             # Utility functions
├── App.tsx          # Main app component with routing
└── index.css        # Global styles & design tokens
```

## 🧪 Testing

The project is set up for testing with React Testing Library. Example test structure:

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# The `dist/` folder contains your production-ready static files
# Deploy to any static hosting service (Vercel, Netlify, etc.)
```

## 🔒 Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- All API requests include auth token via interceptor
- 401 responses automatically redirect to login
- File uploads are validated for type and size
- CORS must be configured on backend

## 🎯 Backend Migration Guide

If your backend uses different endpoint names or response structures:

1. **API Client** (`src/api/apiClient.ts`): Update base URL and interceptors
2. **Auth Context** (`src/contexts/AuthContext.tsx`): Adjust auth endpoint paths
3. **Guest Match** (`src/pages/GuestMatch.tsx`): Update match endpoint and response format
4. **Socket Events**: Modify event names in `useSocket` hook and GuestMatch component

## 📝 Environment Variables

Required variables for production:

```env
VITE_API_URL=https://api.production.com
VITE_SOCKET_URL=https://api.production.com
VITE_GOOGLE_CLIENT_ID=optional
VITE_SENTRY_DSN=optional
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check the [documentation](https://docs.photolelo.com)
- Contact support@photolelo.com

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
