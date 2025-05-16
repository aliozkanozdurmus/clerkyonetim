import express from 'express';
import dotenv from 'dotenv';
import { Clerk } from '@clerk/clerk-sdk-node';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import fs from 'fs';

// Load environment variables - force load from multiple possible files
dotenv.config();
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development' });
dotenv.config({ path: '.env.development.local' });

// If environment variables are not loaded, try to load them manually
if (!process.env.CLERK_SECRET_KEY) {
  try {
    console.log("Environment variables not properly loaded, trying to load manually...");
    
    // Try to read .env file manually
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            process.env[key.trim()] = value;
          }
        }
      }
      
      console.log("Manually loaded environment variables from .env file");
    }
    
    // Try to read .env.local file manually
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            process.env[key.trim()] = value;
          }
        }
      }
      
      console.log("Manually loaded environment variables from .env.local file");
    }
  } catch (err) {
    console.error("Error loading environment variables manually:", err);
  }
}

// Doğrudan API anahtarını tanımlama (son çare)
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_live_OpePEXPU2LFuCS2fJrfS2JJOVNuRJJYh9zBipuFtSd';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000; // Fixed port as per requirement

// Print env for debugging - show the full key values for debugging purposes
console.log("Server ENV Config (FULL):", {
  port: PORT,
  clerkSecretKey: CLERK_SECRET_KEY ? CLERK_SECRET_KEY.substring(0, 10) + '...' : undefined,
  envClerkKey: process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 10) + '...' : undefined
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Needed for frontend APIs to work properly
}));

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.static('dist'));

// Initialize Clerk with environment variables
let clerk;
try {
  console.log("Attempting to initialize Clerk with direct key");
  
  clerk = new Clerk(CLERK_SECRET_KEY);
  console.log("Clerk initialized successfully");
} catch (error) {
  console.error("Error initializing Clerk:", error);
}

// Demo data for when Clerk is not available
const demoUsers = [
  {
    id: 'user_1',
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    subscriptionEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 15,
    isActive: true,
    isLocked: false
  },
  {
    id: 'user_2',
    email: 'user2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    subscriptionEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: -5,
    isActive: false,
    isLocked: true
  },
  {
    id: 'user_3',
    email: 'user3@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    subscriptionEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 3,
    isActive: true,
    isLocked: false
  },
  {
    id: 'user_4',
    email: 'user4@example.com',
    firstName: 'Bob',
    lastName: 'Williams',
    subscriptionEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 60,
    isActive: true,
    isLocked: false
  },
  {
    id: 'user_5',
    email: 'user5@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    subscriptionEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 1,
    isActive: true,
    isLocked: false
  }
];

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    if (!clerk) {
      console.log("Serving demo user data (Clerk not initialized)");
      return res.json(demoUsers);
    }

    console.log("Fetching users from Clerk API...");
    
    // Test Clerk API with a simple call first
    try {
      const testCall = await clerk.users.getCount();
      console.log("Clerk API test successful, user count:", testCall);
    } catch (testError) {
      console.error("Clerk API test failed:", testError);
      return res.json(demoUsers);
    }
    
    const users = await clerk.users.getUserList();
    console.log(`Retrieved ${users.length} users from Clerk API`);
    
    // Process users to add subscription info and handle expired subscriptions
    const processedUsers = await Promise.all(users.map(async (user) => {
      const subscriptionEnd = user.publicMetadata?.subscription_end;
      const now = new Date();
      const endDate = subscriptionEnd ? new Date(subscriptionEnd) : null;
      const daysRemaining = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0;

      // Automatically lock and sign out expired users
      if (endDate && endDate < now && !user.locked) {
        try {
          // Lock the user
          await clerk.users.updateUser(user.id, { 
            publicMetadata: { ...user.publicMetadata },
            locked: true 
          });
          
          // Sign out from all devices
          await clerk.users.revokeAllSessions(user.id);
          console.log(`User ${user.id} locked and sessions revoked due to expired subscription.`);
        } catch (lockError) {
          console.error(`Error locking/revoking sessions for user ${user.id}:`, lockError);
        }
      }
      
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || 'No email',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        subscriptionEnd: subscriptionEnd,
        daysRemaining: daysRemaining,
        isActive: endDate ? endDate > now : false,
        isLocked: user.locked || false
      };
    }));

    console.log(`Processed ${processedUsers.length} users from Clerk API`);
    res.json(processedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.log("Falling back to demo data due to error");
    res.json(demoUsers);
  }
});

// Lock user and sign out from all devices
app.post('/api/users/:userId/lock', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!clerk) {
      // Find the user in the demo data
      const userIndex = demoUsers.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        // Update the user in the demo data
        demoUsers[userIndex].isLocked = true;
        demoUsers[userIndex].isActive = false;
        
        console.log(`Demo user ${userId} locked`);
      }
      
      return res.json({ success: true, message: 'User locked and signed out successfully (Demo)' });
    }
    
    // Using Clerk API
    // Get current user data
    const user = await clerk.users.getUser(userId);
    
    // Lock the user
    await clerk.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata },
      locked: true
    });
    
    // Sign out from all devices
    await clerk.users.revokeAllSessions(userId);
    
    console.log(`User ${userId} locked and sessions revoked via Clerk API`);
    res.json({ success: true, message: 'User locked and signed out successfully' });
  } catch (error) {
    console.error('Error locking user:', error);
    res.status(500).json({ error: 'Failed to lock user', details: error.message });
  }
});

// Simple status endpoint - useful for checking if API is running
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    clerkInitialized: !!clerk,
    usingClerkAPI: !!clerk
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, using ${clerk ? 'Clerk API' : 'demo data'}`);
}); 