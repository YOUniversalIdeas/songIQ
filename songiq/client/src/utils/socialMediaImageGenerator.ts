import { SongData } from '../types/song';

interface ImageGenerationOptions {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoColor: string;
}

export const generateSocialMediaImage = async (
  songData: SongData,
  templateType: string,
  canvas: HTMLCanvasElement
): Promise<string> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const options = getImageOptions(templateType);
  canvas.width = options.width;
  canvas.height = options.height;

  // Clear canvas
  ctx.clearRect(0, 0, options.width, options.height);

  // Create gradient background
  const gradient = createGradient(ctx, options, canvas.width, canvas.height);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add logo
  drawLogo(ctx, options, canvas.width, canvas.height);

  // Add song information
  drawSongInfo(ctx, songData, options, canvas.width, canvas.height);

  // Add success score
  drawSuccessScore(ctx, songData, options, canvas.width, canvas.height);

  // Add breakdown scores
  drawBreakdownScores(ctx, songData, options, canvas.width, canvas.height);

  // Add branding
  drawBranding(ctx, options, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};

const getImageOptions = (templateType: string): ImageGenerationOptions => {
  const baseOptions = {
    width: 1080,
    height: 1920,
    backgroundColor: '#ff6b35',
    textColor: '#ffffff',
    accentColor: '#ffcc02',
    logoColor: '#ffffff'
  };

  switch (templateType) {
    case 'instagram-story':
      return { ...baseOptions, width: 1080, height: 1920 };
    case 'twitter-post':
      return { ...baseOptions, width: 1200, height: 675 };
    case 'facebook-post':
      return { ...baseOptions, width: 1200, height: 630 };
    case 'linkedin-post':
      return { ...baseOptions, width: 1200, height: 627 };
    case 'tiktok-description':
      return { ...baseOptions, width: 1080, height: 1920 };
    default:
      return baseOptions;
  }
};

const createGradient = (ctx: CanvasRenderingContext2D, options: ImageGenerationOptions, width: number, height: number): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  switch (options.backgroundColor) {
    case '#ff6b35':
      gradient.addColorStop(0, '#ff8c42');
      gradient.addColorStop(0.25, '#ff6b35');
      gradient.addColorStop(0.5, '#ff5722');
      gradient.addColorStop(0.75, '#ff7043');
      gradient.addColorStop(1, '#ffab40');
      break;
    default:
      gradient.addColorStop(0, options.backgroundColor);
      gradient.addColorStop(1, options.backgroundColor);
  }
  
  return gradient;
};

const drawLogo = (ctx: CanvasRenderingContext2D, options: ImageGenerationOptions, width: number, height: number) => {
  ctx.fillStyle = options.logoColor;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const logoText = 'songIQ';
  const logoX = width / 2;
  const logoY = height * 0.1;
  
  // Draw main logo
  ctx.fillText(logoText, logoX, logoY);
  
  // Draw accent on "IQ"
  ctx.fillStyle = options.accentColor;
  const textWidth = ctx.measureText('song').width;
  const iqX = logoX + textWidth / 2;
  ctx.fillText('IQ', iqX, logoY);
  
  // Reset color
  ctx.fillStyle = options.textColor;
};

const drawSongInfo = (ctx: CanvasRenderingContext2D, songData: SongData, options: ImageGenerationOptions, width: number, height: number) => {
  ctx.fillStyle = options.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Song title
  ctx.font = 'bold 36px Arial';
  const titleY = height * 0.25;
  ctx.fillText(songData.title, width / 2, titleY);
  
  // Artist name
  ctx.font = '24px Arial';
  const artistY = titleY + 50;
  ctx.fillText(`by ${songData.artist}`, width / 2, artistY);
  
  // Music note emoji
  ctx.font = '48px Arial';
  const emojiY = titleY - 80;
  ctx.fillText('🎵', width / 2, emojiY);
};

const drawSuccessScore = (ctx: CanvasRenderingContext2D, songData: SongData, options: ImageGenerationOptions, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height * 0.45;
  const radius = 120;
  
  // Draw background circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw score
  ctx.fillStyle = options.accentColor;
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(songData.successScore.overallScore.toString(), centerX, centerY - 10);
  
  // Draw "Success Score" text
  ctx.fillStyle = options.textColor;
  ctx.font = '18px Arial';
  ctx.fillText('Success Score', centerX, centerY + 30);
};

const drawBreakdownScores = (ctx: CanvasRenderingContext2D, songData: SongData, options: ImageGenerationOptions, width: number, height: number) => {
  const startY = height * 0.65;
  const boxWidth = width * 0.8;
  const boxHeight = 200;
  const boxX = (width - boxWidth) / 2;
  const boxY = startY;
  
  // Draw background box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  
  // Draw breakdown scores
  const scores = [
    { label: 'Audio', value: songData.successScore.breakdown.audioFeatures },
    { label: 'Market', value: songData.successScore.breakdown.marketTrends },
    { label: 'Genre', value: songData.successScore.breakdown.genreAlignment },
    { label: 'Seasonal', value: songData.successScore.breakdown.seasonalFactors }
  ];
  
  const cols = 2;
  const rows = 2;
  const cellWidth = boxWidth / cols;
  const cellHeight = boxHeight / rows;
  
  scores.forEach((score, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cellX = boxX + col * cellWidth;
    const cellY = boxY + row * cellHeight;
    
    // Draw score value
    ctx.fillStyle = options.accentColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.value.toString(), cellX + cellWidth / 2, cellY + cellHeight / 2 - 10);
    
    // Draw score label
    ctx.fillStyle = options.textColor;
    ctx.font = '14px Arial';
    ctx.fillText(score.label, cellX + cellWidth / 2, cellY + cellHeight / 2 + 15);
  });
};

const drawBranding = (ctx: CanvasRenderingContext2D, options: ImageGenerationOptions, width: number, height: number) => {
  ctx.fillStyle = options.textColor;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const brandingY = height * 0.9;
  ctx.fillText('Powered by songIQ AI', width / 2, brandingY);
  
  const websiteY = brandingY + 25;
  ctx.font = '14px Arial';
  ctx.fillText('songiq.ai', width / 2, websiteY);
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
