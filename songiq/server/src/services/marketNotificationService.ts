import User from '../models/User';
import Market from '../models/Market';
import Position from '../models/Position';
import Comment from '../models/Comment';
import { sendEmail } from './emailService';

// Email templates for market notifications
export const createMarketResolvedEmail = (data: {
  userName: string;
  marketTitle: string;
  outcome: string;
  payout: number;
  marketUrl: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .highlight { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Market Resolved!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Great news! The market you participated in has been resolved:</p>
          
          <div class="highlight">
            <h2 style="margin: 0 0 10px 0; color: #10b981;">✓ ${data.marketTitle}</h2>
            <p style="margin: 5px 0;"><strong>Winning Outcome:</strong> ${data.outcome}</p>
            ${data.payout > 0 ? `<p style="margin: 5px 0; color: #10b981; font-size: 18px;"><strong>Your Payout: $${data.payout.toFixed(2)}</strong></p>` : ''}
          </div>
          
          ${data.payout > 0 ? 
            '<p>Congratulations! Your winning position has been paid out. Check your portfolio to see your updated balance.</p>' :
            '<p>Unfortunately, your position was not on the winning outcome. Better luck next time!</p>'
          }
          
          <div style="text-align: center;">
            <a href="${data.marketUrl}" class="button">View Market Details</a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280;">Keep predicting and trading on songIQ!</p>
        </div>
        <div class="footer">
          <p>songIQ - Music Prediction Markets</p>
          <p style="font-size: 12px; margin-top: 10px;">© 2025 songIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createNewCommentEmail = (data: {
  userName: string;
  commenterName: string;
  marketTitle: string;
  commentText: string;
  marketUrl: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .comment-box { background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Comment</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p><strong>${data.commenterName}</strong> commented on a market you're participating in:</p>
          
          <h3 style="color: #1f2937; margin: 20px 0 10px 0;">${data.marketTitle}</h3>
          
          <div class="comment-box">
            <p style="margin: 0; color: #374151; font-style: italic;">"${data.commentText}"</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.marketUrl}" class="button">View Discussion</a>
          </div>
        </div>
        <div class="footer">
          <p>songIQ - Music Prediction Markets</p>
          <p style="font-size: 12px; margin-top: 10px;">© 2025 songIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createPositionUpdateEmail = (data: {
  userName: string;
  marketTitle: string;
  outcomeChanges: string;
  currentValue: number;
  pnl: number;
  marketUrl: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .stats-box { background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Position Update</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Your position in <strong>${data.marketTitle}</strong> has been updated:</p>
          
          <div class="stats-box">
            <p style="margin: 5px 0;"><strong>Price Changes:</strong> ${data.outcomeChanges}</p>
            <p style="margin: 5px 0;"><strong>Current Value:</strong> $${data.currentValue.toFixed(2)}</p>
            <p style="margin: 5px 0; font-size: 18px; color: ${data.pnl >= 0 ? '#10b981' : '#ef4444'};">
              <strong>P&L: ${data.pnl >= 0 ? '+' : ''}$${data.pnl.toFixed(2)}</strong>
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.marketUrl}" class="button">View Market</a>
          </div>
        </div>
        <div class="footer">
          <p>songIQ - Music Prediction Markets</p>
          <p style="font-size: 12px; margin-top: 10px;">© 2025 songIQ. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createDailySummaryEmail = (data: {
  userName: string;
  totalPnL: number;
  todaysTrades: number;
  activePositions: number;
  newComments: number;
  dashboardUrl: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { padding: 40px 30px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; margin: 10px 0; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📈 Your Daily Summary</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Here's your daily trading summary:</p>
          
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-label">Total P&L</div>
              <div class="stat-value" style="color: ${data.totalPnL >= 0 ? '#10b981' : '#ef4444'};">
                ${data.totalPnL >= 0 ? '+' : ''}$${data.totalPnL.toFixed(2)}
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Trades Today</div>
              <div class="stat-value">${data.todaysTrades}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Active Positions</div>
              <div class="stat-value">${data.activePositions}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">New Comments</div>
              <div class="stat-value">${data.newComments}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.dashboardUrl}" class="button">View Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>songIQ - Music Prediction Markets</p>
          <p style="font-size: 12px; margin-top: 10px;">© 2025 songIQ. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 5px;">
            <a href="{unsubscribe_url}" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Notification service functions
export class MarketNotificationService {
  
  // Notify users when a market they're in is resolved
  static async notifyMarketResolution(marketId: string) {
    try {
      const market = await Market.findById(marketId);
      if (!market || market.status !== 'resolved') return;

      const positions = await Position.find({ marketId, shares: { $gt: 0 } })
        .populate('userId');

      const winningOutcome = market.outcomes.find(o => o.id === market.resolvedOutcomeId);
      if (!winningOutcome) return;

      const baseUrl = process.env.FRONTEND_URL || 'https://songiq.ai';

      for (const position of positions) {
        const user = position.userId as any;
        if (!user || !user.preferences?.notifications?.email) continue;

        const isWinner = position.outcomeId === market.resolvedOutcomeId;
        const payout = isWinner ? position.shares * 1.0 : 0;

        const emailHtml = createMarketResolvedEmail({
          userName: user.firstName || user.username || 'User',
          marketTitle: market.title,
          outcome: winningOutcome.name,
          payout,
          marketUrl: `${baseUrl}/markets/${marketId}`
        });

        await sendEmail({
          to: user.email,
          subject: `Market Resolved: ${market.title}`,
          html: emailHtml
        });
      }

      console.log(`Sent ${positions.length} market resolution notifications`);
    } catch (error) {
      console.error('Error sending market resolution notifications:', error);
    }
  }

  // Notify users when someone comments on their market
  static async notifyNewComment(commentId: string) {
    try {
      const comment = await Comment.findById(commentId)
        .populate('userId')
        .populate('marketId');

      if (!comment || !comment.marketId) return;

      const market = comment.marketId as any;
      const commenter = comment.userId as any;

      // Get users with positions in this market
      const positions = await Position.find({ 
        marketId: market._id, 
        shares: { $gt: 0 } 
      }).populate('userId');

      const baseUrl = process.env.FRONTEND_URL || 'https://songiq.ai';

      // Notify each user (except the commenter)
      for (const position of positions) {
        const user = position.userId as any;
        if (!user || user._id.toString() === commenter._id.toString()) continue;
        if (!user.preferences?.notifications?.email) continue;

        const emailHtml = createNewCommentEmail({
          userName: user.firstName || user.username || 'User',
          commenterName: commenter.firstName || commenter.username || 'Someone',
          marketTitle: market.title,
          commentText: comment.content.substring(0, 200),
          marketUrl: `${baseUrl}/markets/${market._id}`
        });

        await sendEmail({
          to: user.email,
          subject: `New comment on: ${market.title}`,
          html: emailHtml
        });
      }
    } catch (error) {
      console.error('Error sending comment notifications:', error);
    }
  }

  // Send daily summary to active users
  static async sendDailySummaries() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get users with email notifications enabled
      const users = await User.find({ 
        'preferences.notifications.email': true,
        isActive: true
      });

      const baseUrl = process.env.FRONTEND_URL || 'https://songiq.ai';

      for (const user of users) {
        // Get today's activity
        const positions = await Position.find({ userId: user._id, shares: { $gt: 0 } });
        const todaysTrades = await Position.countDocuments({
          userId: user._id,
          createdAt: { $gte: oneDayAgo }
        });

        // Get new comments on their markets
        const userPositionMarkets = positions.map(p => p.marketId);
        const newComments = await Comment.countDocuments({
          marketId: { $in: userPositionMarkets },
          createdAt: { $gte: oneDayAgo },
          userId: { $ne: user._id }
        });

        // Only send if there's activity
        if (todaysTrades > 0 || newComments > 0 || positions.length > 0) {
          const totalPnL = positions.reduce((sum, p) => sum + p.realizedPnL + p.unrealizedPnL, 0);

          const emailHtml = createDailySummaryEmail({
            userName: user.firstName || user.username || 'User',
            totalPnL,
            todaysTrades,
            activePositions: positions.length,
            newComments,
            dashboardUrl: `${baseUrl}/portfolio`
          });

          await sendEmail({
            to: user.email,
            subject: 'Your Daily Trading Summary - songIQ',
            html: emailHtml
          });
        }
      }

      console.log(`Sent daily summaries to ${users.length} users`);
    } catch (error) {
      console.error('Error sending daily summaries:', error);
    }
  }

  // Weekly summary (more detailed)
  static async sendWeeklySummaries() {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const users = await User.find({ 
        'preferences.notifications.email': true,
        isActive: true
      });

      // Similar to daily but with week's data
      // Implementation would be similar to daily summary
      
      console.log(`Would send weekly summaries to ${users.length} users`);
    } catch (error) {
      console.error('Error sending weekly summaries:', error);
    }
  }
}

export default MarketNotificationService;

