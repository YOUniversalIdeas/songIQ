export interface EmailTemplateData {
  userName: string;
  baseUrl: string;
  verificationUrl?: string;
  resetUrl?: string;
  // Phase 2: Subscription & Billing
  newPlan?: string;
  oldPlan?: string;
  amount?: string;
  newAmount?: string;
  nextBillingDate?: string;
  effectiveDate?: string;
  invoiceUrl?: string;
  features?: string[];
  // Phase 2: Payment
  plan?: string;
  paymentDate?: string;
  transactionId?: string;
  failureReason?: string;
  // Phase 2: Analysis
  songTitle?: string;
  artistName?: string;
  duration?: string;
  analysisType?: string;
  analysisUrl?: string;
  uploadDate?: string;
  errorMessage?: string;
  // Phase 3: Engagement & Marketing
  featureName?: string;
  featureDescription?: string;
  featureUrl?: string;
  featureBenefits?: string[];
  tipCategory?: string;
  tips?: string[];
  tipsUrl?: string;
  proTipTitle?: string;
  proTipDescription?: string;
  [key: string]: any; // Allow additional properties for different email types
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type EmailType = 
  | 'verification'
  | 'welcome'
  | 'password-reset'
  | 'password-reset-confirmation'
  | 'subscription-upgrade'
  | 'subscription-downgrade'
  | 'payment-success'
  | 'payment-failed'
  | 'analysis-complete'
  | 'analysis-failed'
  | 'account-security'
  | 'marketing';
