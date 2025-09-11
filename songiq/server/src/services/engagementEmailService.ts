import { 
  sendWelcomeSeriesDay1Email,
  sendWelcomeSeriesDay3Email,
  sendWelcomeSeriesDay7Email,
  sendFeatureAnnouncementEmail,
  sendUsageTipsEmail,
  sendReEngagementEmail
} from './emailService';
import { EmailTemplateData } from '../types/email';

// Welcome series management
export class WelcomeSeriesManager {
  private static instance: WelcomeSeriesManager;
  private userProgress: Map<string, { day: number; lastEmail: Date }> = new Map();

  private constructor() {}

  static getInstance(): WelcomeSeriesManager {
    if (!WelcomeSeriesManager.instance) {
      WelcomeSeriesManager.instance = new WelcomeSeriesManager();
    }
    return WelcomeSeriesManager.instance;
  }

  // Start welcome series for new user
  async startWelcomeSeries(userEmail: string, userName: string): Promise<boolean> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      // Send Day 1 email immediately
      const day1Result = await sendWelcomeSeriesDay1Email({
        userName,
        baseUrl,
        email: userEmail
      });

      if (day1Result) {
        this.userProgress.set(userEmail, { day: 1, lastEmail: new Date() });
        console.log(`Welcome series started for ${userEmail}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error starting welcome series:', error);
      return false;
    }
  }

  // Continue welcome series based on user activity
  async continueWelcomeSeries(userEmail: string, userName: string): Promise<boolean> {
    try {
      const progress = this.userProgress.get(userEmail);
      if (!progress) return false;

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const now = new Date();
      const daysSinceLastEmail = Math.floor((now.getTime() - progress.lastEmail.getTime()) / (1000 * 60 * 60 * 24));

      let emailSent = false;

      // Send Day 3 email after 2 days
      if (progress.day === 1 && daysSinceLastEmail >= 2) {
        const day3Result = await sendWelcomeSeriesDay3Email({
          userName,
          baseUrl,
          email: userEmail
        });
        
        if (day3Result) {
          progress.day = 3;
          progress.lastEmail = now;
          emailSent = true;
        }
      }
      // Send Day 7 email after 4 more days
      else if (progress.day === 3 && daysSinceLastEmail >= 4) {
        const day7Result = await sendWelcomeSeriesDay7Email({
          userName,
          baseUrl,
          email: userEmail
        });
        
        if (day7Result) {
          progress.day = 7;
          progress.lastEmail = now;
          emailSent = true;
        }
      }

      if (emailSent) {
        this.userProgress.set(userEmail, progress);
        console.log(`Welcome series continued for ${userEmail} - Day ${progress.day}`);
      }

      return emailSent;
    } catch (error) {
      console.error('Error continuing welcome series:', error);
      return false;
    }
  }

  // Get user progress
  getUserProgress(userEmail: string): { day: number; lastEmail: Date } | undefined {
    return this.userProgress.get(userEmail);
  }

  // Reset user progress (for testing)
  resetUserProgress(userEmail: string): void {
    this.userProgress.delete(userEmail);
  }
}

// Feature announcement manager
export class FeatureAnnouncementManager {
  private static instance: FeatureAnnouncementManager;
  private announcedFeatures: Set<string> = new Set();

  private constructor() {}

  static getInstance(): FeatureAnnouncementManager {
    if (!FeatureAnnouncementManager.instance) {
      FeatureAnnouncementManager.instance = new FeatureAnnouncementManager();
    }
    return FeatureAnnouncementManager.instance;
  }

  // Announce new feature to all users
  async announceFeature(
    userEmails: string[],
    userName: string,
    featureName: string,
    featureDescription: string,
    featureUrl: string,
    featureBenefits: string[]
  ): Promise<{ total: number; success: number; failed: number }> {
    const results = await Promise.all(
      userEmails.map(async (email) => {
        try {
          const result = await sendFeatureAnnouncementEmail({
            userName,
            baseUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
            email,
            featureName,
            featureDescription,
            featureUrl,
            featureBenefits
          });
          
          return { email, success: result };
        } catch (error) {
          console.error(`Failed to send feature announcement to ${email}:`, error);
          return { email, success: false };
        }
      })
    );

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (success > 0) {
      this.announcedFeatures.add(featureName);
    }

    return { total: userEmails.length, success, failed };
  }

  // Check if feature was already announced
  isFeatureAnnounced(featureName: string): boolean {
    return this.announcedFeatures.has(featureName);
  }
}

// Usage tips manager
export class UsageTipsManager {
  private static instance: UsageTipsManager;
  private tipCategories = [
    'Getting Started',
    'Advanced Analysis',
    'Market Insights',
    'Report Generation',
    'Team Collaboration',
    'Performance Optimization'
  ];

  private constructor() {}

  static getInstance(): UsageTipsManager {
    if (!UsageTipsManager.instance) {
      UsageTipsManager.instance = new UsageTipsManager();
    }
    return UsageTipsManager.instance;
  }

  // Send weekly tips to users
  async sendWeeklyTips(
    userEmails: string[],
    userName: string,
    tipCategory: string,
    tips: string[],
    tipsUrl: string,
    proTipTitle: string,
    proTipDescription: string
  ): Promise<{ total: number; success: number; failed: number }> {
    const results = await Promise.all(
      userEmails.map(async (email) => {
        try {
          const result = await sendUsageTipsEmail({
            userName,
            baseUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
            email,
            tipCategory,
            tips,
            tipsUrl,
            proTipTitle,
            proTipDescription
          });
          
          return { email, success: result };
        } catch (error) {
          console.error(`Failed to send usage tips to ${email}:`, error);
          return { email, success: false };
        }
      })
    );

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return { total: userEmails.length, success, failed };
  }

  // Get available tip categories
  getTipCategories(): string[] {
    return [...this.tipCategories];
  }

  // Add new tip category
  addTipCategory(category: string): void {
    if (!this.tipCategories.includes(category)) {
      this.tipCategories.push(category);
    }
  }
}

// Re-engagement campaign manager
export class ReEngagementManager {
  private static instance: ReEngagementManager;
  private reEngagementSent: Set<string> = new Set();

  private constructor() {}

  static getInstance(): ReEngagementManager {
    if (!ReEngagementManager.instance) {
      ReEngagementManager.instance = new ReEngagementManager();
    }
    return ReEngagementManager.instance;
  }

  // Send re-engagement email to inactive users
  async sendReEngagementCampaign(
    userEmails: string[],
    userName: string
  ): Promise<{ total: number; success: number; failed: number }> {
    const results = await Promise.all(
      userEmails.map(async (email) => {
        try {
          const result = await sendReEngagementEmail({
            userName,
            baseUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
            email
          });
          
          if (result) {
            this.reEngagementSent.add(email);
          }
          
          return { email, success: result };
        } catch (error) {
          console.error(`Failed to send re-engagement email to ${email}:`, error);
          return { email, success: false };
        }
      })
    );

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return { total: userEmails.length, success, failed };
  }

  // Check if re-engagement was sent to user
  hasReEngagementBeenSent(userEmail: string): boolean {
    return this.reEngagementSent.has(userEmail);
  }

  // Reset re-engagement status (for testing)
  resetReEngagementStatus(userEmail: string): void {
    this.reEngagementSent.delete(userEmail);
  }
}

// Export singleton instances
export const welcomeSeriesManager = WelcomeSeriesManager.getInstance();
export const featureAnnouncementManager = FeatureAnnouncementManager.getInstance();
export const usageTipsManager = UsageTipsManager.getInstance();
export const reEngagementManager = ReEngagementManager.getInstance();
