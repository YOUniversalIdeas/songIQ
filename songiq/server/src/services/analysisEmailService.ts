import { 
  sendAnalysisCompleteEmail,
  sendAnalysisFailedEmail
} from './emailService';
import { EmailTemplateData } from '../types/email';

// Send analysis completion email
export const sendAnalysisCompleteNotification = async (
  userEmail: string,
  userName: string,
  songTitle: string,
  artistName: string,
  duration: string,
  analysisType: string,
  analysisId: string
): Promise<boolean> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  const analysisData: EmailTemplateData = {
    userName,
    baseUrl,
    email: userEmail,
    songTitle,
    artistName,
    duration,
    analysisType,
    analysisUrl: `${baseUrl}/analysis/${analysisId}`
  };
  
  return await sendAnalysisCompleteEmail(analysisData);
};

// Send analysis failure email
export const sendAnalysisFailureNotification = async (
  userEmail: string,
  userName: string,
  songTitle: string,
  artistName: string,
  errorMessage: string
): Promise<boolean> => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  const analysisData: EmailTemplateData = {
    userName,
    baseUrl,
    email: userEmail,
    songTitle,
    artistName,
    uploadDate: new Date().toLocaleDateString(),
    errorMessage
  };
  
  return await sendAnalysisFailedEmail(analysisData);
};

// Send batch analysis completion email
export const sendBatchAnalysisCompleteNotification = async (
  userEmail: string,
  userName: string,
  completedAnalyses: Array<{
    songTitle: string;
    artistName: string;
    analysisId: string;
  }>
): Promise<boolean> => {
  // For now, send individual emails for each completed analysis
  // In the future, we could create a batch completion template
  const results = await Promise.all(
    completedAnalyses.map(analysis =>
      sendAnalysisCompleteNotification(
        userEmail,
        userName,
        analysis.songTitle,
        analysis.artistName,
        'N/A', // Duration not available in batch
        'Batch Analysis',
        analysis.analysisId
      )
    )
  );
  
  return results.every(result => result);
};

// Send analysis progress update (for long-running analyses)
export const sendAnalysisProgressUpdate = async (
  userEmail: string,
  userName: string,
  songTitle: string,
  progress: number
): Promise<boolean> => {
  // This would use a new template for progress updates
  // For now, we'll use the analysis complete template with progress info
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  const progressData: EmailTemplateData = {
    userName,
    baseUrl,
    email: userEmail,
    songTitle,
    artistName: 'Your Music',
    duration: 'N/A',
    analysisType: `Progress Update (${progress}%)`,
    analysisUrl: `${baseUrl}/dashboard`
  };
  
  return await sendAnalysisCompleteEmail(progressData);
};
