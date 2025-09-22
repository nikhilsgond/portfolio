import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS
app.use(cors({
  origin: [
    'https://nikhil-portfolio-emne.onrender.com',
    'https://portfolio-fullstack-v7p9.onrender.com',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(path.resolve(), '../frontend')));
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Contact form submission received:', req.body);

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({
      error: 'Name, email, and message are required fields'
    });
  }

  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailSubject = `Portfolio Contact - ${subject || `Message from ${name}`} [${timestamp}]`;
  console.log('Generated email subject:', emailSubject);

  // Brevo API email payload
  const brevoPayload = {
    sender: { name: 'Portfolio Contact', email: process.env.BREVO_USER },
    to: [{ email: process.env.GMAIL_USER, name: 'Portfolio Owner' }],
    subject: emailSubject,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          New Portfolio Contact Form Submission
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p><strong style="color: #555;">Received:</strong> ${timestamp}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; background-color: #f2f2f2; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 8px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background-color: #f2f2f2;"><strong>Email:</strong></td>
            <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; background-color: #f2f2f2;"><strong>Subject:</strong></td>
            <td style="padding: 8px;">${subject || 'Not specified'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; border-radius: 3px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #ccc; color: #777; font-size: 12px;">
          <p>Sent from your portfolio contact form</p>
          <p>Time: ${timestamp}</p>
        </div>
      </div>
    `
  };

  try {
    console.log('Attempting to send email via Brevo API...');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(brevoPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Email sent successfully!', result);
      res.status(200).json({ message: 'Message sent successfully!', result });
    } else {
      console.error('Error sending email:', result);
      res.status(500).json({ error: 'Failed to send email', details: result });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'An error occurred while sending the message. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(path.resolve(), '../frontend/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
