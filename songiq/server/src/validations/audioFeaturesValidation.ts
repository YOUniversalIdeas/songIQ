import Joi from 'joi';

export const createAudioFeaturesSchema = Joi.object({
  songId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid song ID format',
      'any.required': 'Song ID is required'
    }),
  
  // Spotify Audio Features
  acousticness: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Acousticness must be a number',
      'number.min': 'Acousticness must be between 0.0 and 1.0',
      'number.max': 'Acousticness must be between 0.0 and 1.0',
      'any.required': 'Acousticness is required'
    }),
  
  danceability: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Danceability must be a number',
      'number.min': 'Danceability must be between 0.0 and 1.0',
      'number.max': 'Danceability must be between 0.0 and 1.0',
      'any.required': 'Danceability is required'
    }),
  
  energy: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Energy must be a number',
      'number.min': 'Energy must be between 0.0 and 1.0',
      'number.max': 'Energy must be between 0.0 and 1.0',
      'any.required': 'Energy is required'
    }),
  
  instrumentalness: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Instrumentalness must be a number',
      'number.min': 'Instrumentalness must be between 0.0 and 1.0',
      'number.max': 'Instrumentalness must be between 0.0 and 1.0',
      'any.required': 'Instrumentalness is required'
    }),
  
  liveness: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Liveness must be a number',
      'number.min': 'Liveness must be between 0.0 and 1.0',
      'number.max': 'Liveness must be between 0.0 and 1.0',
      'any.required': 'Liveness is required'
    }),
  
  loudness: Joi.number()
    .required()
    .min(-60.0)
    .max(0.0)
    .messages({
      'number.base': 'Loudness must be a number',
      'number.min': 'Loudness must be between -60.0 and 0.0 dB',
      'number.max': 'Loudness must be between -60.0 and 0.0 dB',
      'any.required': 'Loudness is required'
    }),
  
  speechiness: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Speechiness must be a number',
      'number.min': 'Speechiness must be between 0.0 and 1.0',
      'number.max': 'Speechiness must be between 0.0 and 1.0',
      'any.required': 'Speechiness is required'
    }),
  
  tempo: Joi.number()
    .required()
    .min(0)
    .max(300)
    .messages({
      'number.base': 'Tempo must be a number',
      'number.min': 'Tempo must be between 0 and 300 BPM',
      'number.max': 'Tempo must be between 0 and 300 BPM',
      'any.required': 'Tempo is required'
    }),
  
  valence: Joi.number()
    .required()
    .min(0.0)
    .max(1.0)
    .messages({
      'number.base': 'Valence must be a number',
      'number.min': 'Valence must be between 0.0 and 1.0',
      'number.max': 'Valence must be between 0.0 and 1.0',
      'any.required': 'Valence is required'
    }),
  
  key: Joi.number()
    .required()
    .min(0)
    .max(11)
    .integer()
    .messages({
      'number.base': 'Key must be a number',
      'number.integer': 'Key must be an integer',
      'number.min': 'Key must be between 0 and 11',
      'number.max': 'Key must be between 0 and 11',
      'any.required': 'Key is required'
    }),
  
  mode: Joi.number()
    .required()
    .valid(0, 1)
    .messages({
      'number.base': 'Mode must be a number',
      'any.only': 'Mode must be 0 (minor) or 1 (major)',
      'any.required': 'Mode is required'
    }),
  
  time_signature: Joi.number()
    .required()
    .min(3)
    .max(7)
    .integer()
    .messages({
      'number.base': 'Time signature must be a number',
      'number.integer': 'Time signature must be an integer',
      'number.min': 'Time signature must be between 3 and 7',
      'number.max': 'Time signature must be between 3 and 7',
      'any.required': 'Time signature is required'
    }),
  
  duration_ms: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be positive',
      'any.required': 'Duration is required'
    })
});

export const updateAudioFeaturesSchema = Joi.object({
  acousticness: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Acousticness must be between 0.0 and 1.0',
      'number.max': 'Acousticness must be between 0.0 and 1.0'
    }),
  
  danceability: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Danceability must be between 0.0 and 1.0',
      'number.max': 'Danceability must be between 0.0 and 1.0'
    }),
  
  energy: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Energy must be between 0.0 and 1.0',
      'number.max': 'Energy must be between 0.0 and 1.0'
    }),
  
  instrumentalness: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Instrumentalness must be between 0.0 and 1.0',
      'number.max': 'Instrumentalness must be between 0.0 and 1.0'
    }),
  
  liveness: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Liveness must be between 0.0 and 1.0',
      'number.max': 'Liveness must be between 0.0 and 1.0'
    }),
  
  loudness: Joi.number()
    .min(-60.0)
    .max(0.0)
    .optional()
    .messages({
      'number.min': 'Loudness must be between -60.0 and 0.0 dB',
      'number.max': 'Loudness must be between -60.0 and 0.0 dB'
    }),
  
  speechiness: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Speechiness must be between 0.0 and 1.0',
      'number.max': 'Speechiness must be between 0.0 and 1.0'
    }),
  
  tempo: Joi.number()
    .min(0)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Tempo must be between 0 and 300 BPM',
      'number.max': 'Tempo must be between 0 and 300 BPM'
    }),
  
  valence: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Valence must be between 0.0 and 1.0',
      'number.max': 'Valence must be between 0.0 and 1.0'
    }),
  
  key: Joi.number()
    .min(0)
    .max(11)
    .integer()
    .optional()
    .messages({
      'number.integer': 'Key must be an integer',
      'number.min': 'Key must be between 0 and 11',
      'number.max': 'Key must be between 0 and 11'
    }),
  
  mode: Joi.number()
    .valid(0, 1)
    .optional()
    .messages({
      'any.only': 'Mode must be 0 (minor) or 1 (major)'
    }),
  
  time_signature: Joi.number()
    .min(3)
    .max(7)
    .integer()
    .optional()
    .messages({
      'number.integer': 'Time signature must be an integer',
      'number.min': 'Time signature must be between 3 and 7',
      'number.max': 'Time signature must be between 3 and 7'
    }),
  
  duration_ms: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Duration must be positive'
    })
});

export const audioFeaturesIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid audio features ID format',
      'any.required': 'Audio features ID is required'
    })
});

export const audioFeaturesQuerySchema = Joi.object({
  songId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid song ID format'
    }),
  
  minTempo: Joi.number()
    .min(0)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Minimum tempo must be between 0 and 300 BPM',
      'number.max': 'Minimum tempo must be between 0 and 300 BPM'
    }),
  
  maxTempo: Joi.number()
    .min(0)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Maximum tempo must be between 0 and 300 BPM',
      'number.max': 'Maximum tempo must be between 0 and 300 BPM'
    }),
  
  minEnergy: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Minimum energy must be between 0.0 and 1.0',
      'number.max': 'Minimum energy must be between 0.0 and 1.0'
    }),
  
  maxEnergy: Joi.number()
    .min(0.0)
    .max(1.0)
    .optional()
    .messages({
      'number.min': 'Maximum energy must be between 0.0 and 1.0',
      'number.max': 'Maximum energy must be between 0.0 and 1.0'
    }),
  
  key: Joi.number()
    .min(0)
    .max(11)
    .integer()
    .optional()
    .messages({
      'number.integer': 'Key must be an integer',
      'number.min': 'Key must be between 0 and 11',
      'number.max': 'Key must be between 0 and 11'
    }),
  
  mode: Joi.number()
    .valid(0, 1)
    .optional()
    .messages({
      'any.only': 'Mode must be 0 (minor) or 1 (major)'
    }),
  
  sortBy: Joi.string()
    .valid('tempo', 'energy', 'danceability', 'valence', 'loudness', 'createdAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: tempo, energy, danceability, valence, loudness, createdAt'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
}); 