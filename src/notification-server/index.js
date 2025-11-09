// Simple Notification Server for FCM
// Can be deployed to Vercel, Railway, Render, or any Node.js hosting

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// You need to download service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Send notification endpoint
 * POST /api/send-notification
 * Body: { tokens: string[], title: string, body: string }
 */
app.post('/api/send-notification', async (req, res) => {
  try {
    const { tokens, title, body } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Prepare the message
    const message = {
      notification: {
        title: title,
        body: body
      },
      tokens: tokens
    };

    // Send to multiple devices
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log('Successfully sent notification:', response);
    
    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Notification server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
});

module.exports = app;
