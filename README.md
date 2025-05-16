# Clerk User Management Dashboard

A modern, animated admin dashboard for managing Clerk users. This project provides a complete solution for monitoring user subscriptions, automatically locking expired accounts, and managing user access.

## Features

- **Modern UI**: Built with React and styled with beautiful, responsive CSS
- **Animations**: Enhanced user experience with Framer Motion animations
- **User Management**: View all Clerk users, their subscription status, and remaining days
- **Automatic Account Locking**: Expired subscriptions are automatically locked and users are signed out
- **Secure Authentication**: Admin authentication with username/password stored in environment variables
- **Search and Filtering**: Easily find users with search and status filtering
- **Responsive Design**: Works beautifully on all devices

## Tech Stack

- **Frontend**: React.js with Framer Motion for animations
- **Backend**: Node.js with Express
- **Authentication**: Basic Auth for admin, Clerk API for user management
- **API Integration**: Clerk API for user data and management

## Project Structure

```
clerkyonetim/
├── .env                  # Environment variables
├── server.js             # Express server 
├── package.json          # Project dependencies
├── vite.config.js        # Vite configuration
├── src/                  # Frontend source code
│   ├── components/       # React components
│   │   ├── Login.jsx     # Admin login component
│   │   ├── Dashboard.jsx # Main dashboard component
│   │   ├── UserTable.jsx # User list and management
│   │   ├── Footer.jsx    # Page footer
│   │   └── ...           # Other components
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── *.css             # Component styling
└── dist/                 # Build output (generated)
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or pnpm

### Installation

1. Clone the repository
```
git clone <repository-url>
cd clerkyonetim
```

2. Install dependencies
```
npm install
# or
pnpm install
```

3. Create a `.env` file in the root directory with the following content:
```
# Server Configuration
PORT=3000

# Admin Authentication
ADMIN_USERNAME=123
ADMIN_PASSWORD=123

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_API_URL=https://api.clerk.dev/v1
CLERK_FRONTEND_API_URL=https://clerk.hukusis.com
CLERK_JWKS_URL=your_clerk_jwks_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuaHVrdXNpcy5jb20k

# Frontend Configuration
VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuaHVrdXNpcy5jb20k
VITE_CLERK_FRONTEND_API_URL=https://clerk.hukusis.com
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE="Clerk Admin Panel"
```

> ⚠️ Replace `your_clerk_secret_key` with your actual Clerk secret key.

### Running the Project

In development mode:
```
npm run dev
# or
pnpm dev
```

For production:
```
npm run build
npm start
# or
pnpm build
pnpm start
```

The application will be available at:
- Backend API: http://localhost:3000
- Frontend (development): http://localhost:3001

## API Endpoints

- `GET /api/users` - Get all Clerk users with subscription status
- `POST /api/users/:userId/lock` - Lock a user's account and sign them out
- `GET /api/status` - Check if the API is running and Clerk is initialized

## Troubleshooting

If you encounter environment variable issues with Vite:
1. Make sure all Vite variables are prefixed with `VITE_`
2. Create a `.env.development.local` file with your frontend variables
3. Restart the development server
4. Check browser console for detailed error messages

## Copyright

Developed by Ali Özkan Özdurmuş 