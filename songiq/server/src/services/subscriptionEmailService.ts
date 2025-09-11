import { 
  sendSubscriptionUpgradeEmail,
  sendSubscriptionDowngradeEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail
} from './emailService';
import { EmailTemplateData } from '../types/email';

// Plan feature definitions
const PLAN_FEATURES = {
  free: [
    'Up to 3 song analyses',
    'Basic music insights',
    'Standard reports',
    'Perfect for trying songIQ'
  ],
  basic: [
    'Up to 50 song analyses',
    'Basic AI insights',
    'Standard reports',
    'Email support'
  ],
  pro: [
    'Unlimited song analyses',
    'Advanced AI insights',
    'Market trend analysis',
    'Priority support',
    'Custom reports'
  ],
  enterprise: [
    'Unlimited song analyses',
    'Enterprise AI insights',
    'Advanced market analysis',
    'Dedicated support',
    'Custom integrations',
    'White-label options',
    'API access'
  ]
};

// Get plan features
export const getPlanFeatures = (plan: string): string[] => {
  return PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free;
};

// Check if plan is an upgrade
export const isPlanUpgrade = (oldPlan: string, newPlan: string): boolean => {
  const planOrder = ['free', 'basic', 'pro', 'enterprise'];
  const oldIndex = planOrder.indexOf(oldPlan.toLowerCase());
  const newIndex = planOrder.indexOf(newPlan.toLowerCase());
  return newIndex > oldIndex;
};

// Send subscription change email
export const sendSubscriptionChangeEmail = async (
  userEmail: string,
  userName: string,
  oldPlan: string,
  newPlan: string,
  amount: string,
  effectiveDate: string
): Promise<boolean> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  if (isPlanUpgrade(oldPlan, newPlan)) {
    // Send upgrade email
    const upgradeData: EmailTemplateData = {
      userName,
      baseUrl,
      email: userEmail,
      newPlan: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
      amount,
      nextBillingDate: effectiveDate,
      invoiceUrl: `${baseUrl}/billing`,
      features: getPlanFeatures(newPlan)
    };
    
    return await sendSubscriptionUpgradeEmail(upgradeData);
  } else {
    // Send downgrade email
    const downgradeData: EmailTemplateData = {
      userName,
      baseUrl,
      email: userEmail,
      oldPlan: oldPlan.charAt(0).toUpperCase() + oldPlan.slice(1),
      newPlan: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
      effectiveDate,
      newAmount: amount,
      features: getPlanFeatures(newPlan)
    };
    
    return await sendSubscriptionDowngradeEmail(downgradeData);
  }
};

// Send payment success email
export const sendPaymentSuccessEmailLocal = async (
  userEmail: string,
  userName: string,
  amount: string,
  plan: string,
  transactionId: string
): Promise<boolean> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  const paymentData: EmailTemplateData = {
    userName,
    baseUrl,
    email: userEmail,
    amount,
    paymentDate: new Date().toLocaleDateString(),
    transactionId,
    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
    invoiceUrl: `${baseUrl}/billing`
  };
  
  return await sendPaymentSuccessEmail(paymentData);
};

// Send payment failed email
export const sendPaymentFailedEmailLocal = async (
  userEmail: string,
  userName: string,
  amount: string,
  plan: string,
  failureReason?: string
): Promise<boolean> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  const paymentData: EmailTemplateData = {
    userName,
    baseUrl,
    email: userEmail,
    amount,
    paymentDate: new Date().toLocaleDateString(),
    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
    failureReason
  };
  
  return await sendPaymentFailedEmail(paymentData);
};

// Send subscription renewal reminder
export const sendRenewalReminder = async (
  userEmail: string,
  userName: string,
  plan: string,
  renewalDate: string,
  amount: string
): Promise<boolean> => {
  // This would use a new template for renewal reminders
  // For now, we'll use the payment success template
  return await sendPaymentSuccessEmailLocal(
    userEmail,
    userName,
    amount,
    plan,
    `renewal_${Date.now()}`
  );
};

// Send subscription cancellation confirmation
export const sendCancellationEmail = async (
  userEmail: string,
  userName: string,
  plan: string,
  endDate: string
): Promise<boolean> => {
  // This would use a new template for cancellations
  // For now, we'll use the downgrade template
  return await sendSubscriptionDowngradeEmail({
    userName,
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    email: userEmail,
    oldPlan: plan.charAt(0).toUpperCase() + plan.slice(1),
    newPlan: 'Free',
    effectiveDate: endDate,
    newAmount: '0.00',
    features: getPlanFeatures('free')
  });
};
