import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot be more than 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot be more than 50 characters',
      'any.required': 'Last name is required'
    }),
  
  username: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .lowercase()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be more than 30 characters',
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
      'any.required': 'Username is required'
    }),
  
  role: Joi.string()
    .valid('user', 'artist', 'producer', 'label', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be one of: user, artist, producer, label, admin'
    }),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio cannot be more than 500 characters'
    }),
  
  preferences: Joi.object({
    genres: Joi.array()
      .items(Joi.string().valid(
        'pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 
        'r&b', 'folk', 'metal', 'indie', 'latin', 'reggae', 'blues', 'punk', 
        'alternative', 'dance', 'soul', 'funk', 'disco', 'other'
      ))
      .optional(),
    
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).optional(),
    
    privacy: Joi.object({
      profilePublic: Joi.boolean().default(true),
      songsPublic: Joi.boolean().default(true),
      analyticsPublic: Joi.boolean().default(false)
    }).optional()
  }).optional()
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.max': 'First name cannot be more than 50 characters'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.max': 'Last name cannot be more than 50 characters'
    }),
  
  username: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .lowercase()
    .optional()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be more than 30 characters',
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
    }),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio cannot be more than 500 characters'
    }),
  
  profilePicture: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Profile picture must be a valid URL'
    }),
  
  preferences: Joi.object({
    genres: Joi.array()
      .items(Joi.string().valid(
        'pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 
        'r&b', 'folk', 'metal', 'indie', 'latin', 'reggae', 'blues', 'punk', 
        'alternative', 'dance', 'soul', 'funk', 'disco', 'other'
      ))
      .optional(),
    
    notifications: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      sms: Joi.boolean()
    }).optional(),
    
    privacy: Joi.object({
      profilePublic: Joi.boolean(),
      songsPublic: Joi.boolean(),
      analyticsPublic: Joi.boolean()
    }).optional()
  }).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'string.empty': 'Please confirm your password',
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password'
    })
});

export const userIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

export const userQuerySchema = Joi.object({
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
  
  role: Joi.string()
    .valid('user', 'artist', 'producer', 'label', 'admin')
    .optional()
    .messages({
      'any.only': 'Role must be one of: user, artist, producer, label, admin'
    }),
  
  isActive: Joi.boolean()
    .optional(),
  
  search: Joi.string()
    .trim()
    .optional(),
  
  sortBy: Joi.string()
    .valid('username', 'firstName', 'lastName', 'createdAt', 'lastLogin')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: username, firstName, lastName, createdAt, lastLogin'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
}); 