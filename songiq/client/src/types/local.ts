// Local types to avoid import issues
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uploadDate: Date;
  fileUrl: string;
  userId?: string;
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bandName: string;
  username: string;
  telephone: string;
  role: 'user' | 'artist' | 'producer' | 'label' | 'admin' | 'superadmin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
