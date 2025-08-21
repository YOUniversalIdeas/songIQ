import { EmailOptions, EmailResult } from '../types/email';
import { sendEmail } from './emailService';

interface QueuedEmail {
  id: string;
  options: EmailOptions;
  attempts: number;
  maxAttempts: number;
  nextRetry: Date;
  createdAt: Date;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    // Start processing queue
    this.processQueue();
  }

  // Add email to queue
  async addToQueue(options: EmailOptions): Promise<string> {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedEmail: QueuedEmail = {
      id,
      options,
      attempts: 0,
      maxAttempts: this.maxRetries,
      nextRetry: new Date(),
      createdAt: new Date()
    };

    this.queue.push(queuedEmail);
    console.log(`Email added to queue: ${id} for ${options.to}`);
    
    return id;
  }

  // Process queue
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift();
      if (!email) continue;

      // Check if it's time to retry
      if (email.attempts > 0 && new Date() < email.nextRetry) {
        // Put it back in the queue for later
        this.queue.push(email);
        continue;
      }

      try {
        console.log(`Processing email: ${email.id} (attempt ${email.attempts + 1})`);
        
        const result = await sendEmail(email.options);
        
        if (result.success) {
          console.log(`Email sent successfully: ${email.id}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`Failed to send email ${email.id}:`, error);
        
        email.attempts++;
        
        if (email.attempts < email.maxAttempts) {
          // Schedule retry with exponential backoff
          const delay = this.retryDelay * Math.pow(2, email.attempts - 1);
          email.nextRetry = new Date(Date.now() + delay);
          
          console.log(`Scheduling retry for email ${email.id} in ${delay}ms`);
          this.queue.push(email);
        } else {
          console.error(`Email ${email.id} failed after ${email.maxAttempts} attempts`);
          // Could log to database or send alert here
        }
      }
    }

    this.processing = false;
    
    // Schedule next processing cycle
    setTimeout(() => this.processQueue(), 1000);
  }

  // Get queue status
  getStatus(): { queueLength: number; processing: boolean } {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }

  // Clear queue (useful for testing)
  clearQueue(): void {
    this.queue = [];
    console.log('Email queue cleared');
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();

// Helper function to add email to queue
export const queueEmail = async (options: EmailOptions): Promise<string> => {
  return emailQueue.addToQueue(options);
};

// Helper function to send email immediately (bypass queue)
export const sendEmailImmediate = async (options: EmailOptions): Promise<EmailResult> => {
  return sendEmail(options);
};
