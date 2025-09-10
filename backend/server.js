const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Updated CORS for Render
app.use(cors({ 
  origin: ['https://your-frontend-service.onrender.com', 'http://localhost:3000'] 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Error with transporter configuration:', error);
  } else {
    console.log('Server is ready to take messages');
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Contact form submission received:', req.body);
  
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ 
      error: 'Name, email, and message are required fields' 
    });
  }

  // Generate timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create email subject with prefix and timestamp
  const emailSubject = `Portfolio Contact - ${subject || `Message from ${name}`} [${timestamp}]`;
  console.log('Generated email subject:', emailSubject);

  // Email content
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: emailSubject,
    html: `
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
    // Send email
    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'An error occurred while sending the message. Please try again later.' 
    });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Serve frontend for all other requests in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});