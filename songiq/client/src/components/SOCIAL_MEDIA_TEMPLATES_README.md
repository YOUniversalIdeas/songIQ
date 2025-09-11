# Social Media Templates Feature

## Overview

The Social Media Templates feature allows users to create branded, shareable content for their song analysis results across multiple social media platforms. This feature integrates with the existing "Share Results" button on the Dashboard page.

## Features

### 🎨 Multiple Platform Support
- **Instagram Stories** - Vertical format (1080x1920) with vibrant gradients
- **Twitter Posts** - Horizontal format (1200x675) with concise messaging
- **Facebook Posts** - Square format (1200x630) with detailed analysis
- **LinkedIn Posts** - Professional format (1200x627) for industry networking
- **TikTok Descriptions** - Vertical format (1080x1920) with trending hashtags

### 🎯 Branded Content Generation
- **Consistent songIQ Branding** - Orange gradient backgrounds with yellow accents
- **Dynamic Content** - Automatically populated with song data and analysis scores
- **Visual Templates** - Canvas-based image generation for each platform
- **Text Templates** - Platform-optimized copy with relevant hashtags

### 📱 User Experience
- **Modal Interface** - Clean, intuitive template selection
- **Live Preview** - Visual preview of generated content
- **Multiple Export Options** - Copy text, download images, or share directly
- **Responsive Design** - Works on desktop and mobile devices

## Technical Implementation

### Components

#### `SocialMediaTemplates.tsx`
Main component that handles:
- Template selection interface
- Content generation and preview
- Export functionality (copy, download, share)
- Modal state management

#### `socialMediaImageGenerator.ts`
Utility for generating actual images:
- Canvas-based image generation
- Platform-specific dimensions and styling
- Gradient backgrounds and branding
- Dynamic content placement

#### `song.ts`
Type definitions for song data structure

### Integration Points

#### `AnalysisDashboard.tsx`
- Updated Share Results button to open template modal
- Added state management for modal visibility
- Integrated SocialMediaTemplates component

## Usage

1. **Access Templates**: Click "Share Results" button on any song's dashboard
2. **Select Platform**: Choose from Instagram, Twitter, Facebook, LinkedIn, or TikTok
3. **Preview Content**: See both visual and text previews
4. **Export Options**:
   - **Copy Text**: Copy formatted text to clipboard
   - **Download**: Download as text file
   - **Share**: Use native sharing API
   - **Generate Image**: Create and download branded image

## Template Customization

### Visual Elements
- **Background**: Orange gradient (songIQ brand colors)
- **Logo**: "songIQ" with yellow "IQ" accent
- **Song Info**: Title, artist, and music note emoji
- **Success Score**: Large, prominent display with accent color
- **Breakdown**: Grid of individual score components
- **Branding**: "Powered by songIQ AI" footer

### Text Content
- **Platform-Specific**: Optimized length and style for each platform
- **Hashtags**: Relevant tags for discoverability
- **Call-to-Action**: Encourages engagement and platform visits
- **Professional Tone**: Appropriate for each platform's audience

## Brand Guidelines

### Colors
- **Primary Orange**: #ff6b35
- **Accent Yellow**: #ffcc02
- **Text White**: #ffffff
- **Gradient**: Orange to yellow spectrum

### Typography
- **Logo**: Bold, large font with accent styling
- **Headings**: Bold, platform-appropriate sizing
- **Body Text**: Clean, readable fonts
- **Scores**: Large, prominent numbers

### Layout
- **Consistent Spacing**: Proper margins and padding
- **Visual Hierarchy**: Clear information organization
- **Platform Optimization**: Dimensions match platform requirements
- **Mobile Responsive**: Adapts to different screen sizes

## Future Enhancements

### Planned Features
- **Custom Branding**: Allow users to customize colors and logos
- **Template Library**: Pre-built templates for different music genres
- **Scheduling**: Integration with social media scheduling tools
- **Analytics**: Track engagement on shared content
- **Batch Generation**: Create multiple templates at once

### Technical Improvements
- **Image Optimization**: Better compression and quality
- **Template Editor**: Visual template customization interface
- **API Integration**: Direct posting to social platforms
- **Cloud Storage**: Save and manage generated content

## File Structure

```
src/
├── components/
│   ├── SocialMediaTemplates.tsx
│   └── SOCIAL_MEDIA_TEMPLATES_README.md
├── utils/
│   └── socialMediaImageGenerator.ts
└── types/
    └── song.ts
```

## Dependencies

- **React**: Component framework
- **Lucide React**: Icons
- **Canvas API**: Image generation
- **Clipboard API**: Text copying
- **Web Share API**: Native sharing

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Features**: Canvas, Clipboard API, Web Share API

## Performance Considerations

- **Lazy Loading**: Templates loaded on demand
- **Image Optimization**: Efficient canvas rendering
- **Memory Management**: Proper cleanup of generated content
- **Responsive Images**: Appropriate sizing for each platform

This feature significantly enhances the user experience by providing professional, branded content that users can easily share across their social media networks, increasing songIQ's visibility and user engagement.
