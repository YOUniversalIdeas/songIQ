import Joi from 'joi';

export const createSongSchema = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Song title is required',
      'string.max': 'Title cannot be more than 100 characters',
      'any.required': 'Song title is required'
    }),
  
  artist: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Artist name is required',
      'string.max': 'Artist name cannot be more than 100 characters',
      'any.required': 'Artist name is required'
    }),
  
  duration: Joi.number()
    .required()
    .positive()
    .max(3600) // Max 1 hour
    .messages({
      'number.base': 'Duration must be a number',
      'number.positive': 'Duration must be positive',
      'number.max': 'Duration cannot exceed 1 hour',
      'any.required': 'Duration is required'
    }),
  
  fileUrl: Joi.string()
    .required()
    .uri()
    .messages({
      'string.empty': 'File URL is required',
      'string.uri': 'File URL must be a valid URL',
      'any.required': 'File URL is required'
    }),
  
  isReleased: Joi.boolean()
    .default(false),
  
  releaseDate: Joi.date()
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Release date is required when song is marked as released'
    }),
  
  platforms: Joi.array()
    .items(Joi.string().valid('spotify', 'apple', 'youtube', 'soundcloud', 'tidal', 'amazon'))
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Platforms are required when song is marked as released'
    })
});

// Schema for temporary uploads (before audio analysis)
export const createTempSongSchema = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Song title is required',
      'string.max': 'Title cannot be more than 100 characters',
      'any.required': 'Song title is required'
    }),
  
  artist: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Artist name is required',
      'string.max': 'Artist name cannot be more than 100 characters',
      'any.required': 'Artist name is required'
    }),
  
  // Duration is not required for temporary uploads
  // It will be extracted during audio analysis
  
  isReleased: Joi.boolean()
    .default(false),
  
  releaseDate: Joi.date()
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Release date is required when song is marked as released'
    }),
  
  platforms: Joi.array()
    .items(Joi.string().valid('spotify', 'apple', 'youtube', 'soundcloud', 'tidal', 'amazon'))
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Platforms are required when song is marked as released'
    }),
  
  genre: Joi.string()
    .optional()
    .default('Pop')
});

export const updateSongSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.max': 'Title cannot be more than 100 characters'
    }),
  
  artist: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.max': 'Artist name cannot be more than 100 characters'
    }),
  
  duration: Joi.number()
    .positive()
    .max(3600)
    .optional()
    .messages({
      'number.positive': 'Duration must be positive',
      'number.max': 'Duration cannot exceed 1 hour'
    }),
  
  isReleased: Joi.boolean()
    .optional(),
  
  releaseDate: Joi.date()
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Release date is required when song is marked as released'
    }),
  
  platforms: Joi.array()
    .items(Joi.string().valid('spotify', 'apple', 'youtube', 'soundcloud', 'tidal', 'amazon'))
    .when('isReleased', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Platforms are required when song is marked as released'
    })
});

export const songIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid song ID format',
      'any.required': 'Song ID is required'
    })
});

export const songQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  artist: Joi.string()
    .trim()
    .optional(),
  
  isReleased: Joi.boolean()
    .optional(),
  
  sortBy: Joi.string()
    .valid('title', 'artist', 'uploadDate', 'duration')
    .default('uploadDate')
    .messages({
      'any.only': 'Sort by must be one of: title, artist, uploadDate, duration'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
}); 