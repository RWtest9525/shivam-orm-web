import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function handleFileUpload(req: AuthenticatedRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  // Generate public file access URL or Cloudflare R2 signed URL
  const fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  return res.json({
    success: true,
    data: {
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
}
