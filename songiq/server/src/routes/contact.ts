import express from 'express';
import { sendEmail } from '../services/emailService';

const router = express.Router();

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Create email content
    const emailSubject = `Contact Form Submission from ${firstName} ${lastName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">🎵 New Contact Form Submission</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Contact Details</h3>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          This message was sent via the songIQ contact form at songiq.ai
        </p>
      </div>
    `;

    const emailText = `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Submitted: ${new Date().toLocaleString()}

Message:
${message}

---
This message was sent via the songIQ contact form at songiq.ai
    `;

    // Send email to admin
    const emailResult = await sendEmail({
      to: 'admin@songiq.ai',
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    if (emailResult.success) {
      console.log(`✅ Contact form submission sent successfully from ${email}`);
      res.json({
        success: true,
        message: 'Your message has been sent successfully!'
      });
    } else {
      console.error('❌ Failed to send contact form email:', emailResult.error);
      
      // Log the contact form submission for manual review when email fails
      console.log('📝 CONTACT FORM SUBMISSION (Email failed, logged for manual review):');
      console.log('Name:', `${firstName} ${lastName}`);
      console.log('Email:', email);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.log('---');
      
      // For now, still return success but log the issue
      res.json({
        success: true,
        message: 'Your message has been received! We will get back to you soon.'
      });
    }

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

export default router;
