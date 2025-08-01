import express from 'express'
import multer from 'multer'
import path from 'path'
import { Song } from '../models'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|flac|m4a/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed'))
    }
  }
})

// POST /api/songs/upload - Upload a new song
router.post('/upload', upload.single('audioFile'), async (req, res) => {
  try {
    const { title, artist, isReleased, releaseDate, platforms } = req.body

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      })
    }

    const songData = {
      title,
      artist,
      audioFile: req.file.path,
      isReleased: isReleased === 'true',
      ...(isReleased === 'true' && releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(isReleased === 'true' && platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    }

    const song = new Song(songData)
    await song.save()

    res.status(201).json({
      success: true,
      data: {
        songId: song._id,
        uploadUrl: `/uploads/${path.basename(req.file.path)}`,
        analysisStatus: 'pending'
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload song'
    })
  }
})

// GET /api/songs/:id - Get song details
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('analysisResults')
      .populate('performanceMetrics')

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    res.json({
      success: true,
      data: song
    })
  } catch (error) {
    console.error('Get song error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve song'
    })
  }
})

// PUT /api/songs/:id - Update song information
router.put('/:id', async (req, res) => {
  try {
    const { title, artist, isReleased, releaseDate, platforms } = req.body

    const updateData = {
      ...(title && { title }),
      ...(artist && { artist }),
      ...(isReleased !== undefined && { isReleased }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    }

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    res.json({
      success: true,
      data: song
    })
  } catch (error) {
    console.error('Update song error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update song'
    })
  }
})

// DELETE /api/songs/:id - Delete a song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id)

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    // TODO: Delete associated files and analysis results

    res.json({
      success: true,
      message: 'Song deleted successfully'
    })
  } catch (error) {
    console.error('Delete song error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete song'
    })
  }
})

// GET /api/songs - Get all songs (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const songs = await Song.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('analysisResults', 'successPrediction.score audioFeatures.genre')
      .populate('performanceMetrics', 'streamingData.spotify.streams')

    const total = await Song.countDocuments()

    res.json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get songs error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve songs'
    })
  }
})

export default router 