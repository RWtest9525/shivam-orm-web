import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getReviewsHandler(req: AuthenticatedRequest, res: Response) {
  const { platform, sentiment, status, search, page = 1, limit = 20 } = req.query;

  return res.json({
    success: true,
    data: {
      reviews: [
        {
          id: 'rev-101',
          platform: platform || 'PLAYSTORE',
          authorName: 'Vikram Singh',
          authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Vikram',
          rating: 5,
          content: 'Excellent app experience! Seamless transactions and quick customer care support.',
          sentiment: 'POSITIVE',
          severity: 'LOW',
          status: 'REPLIED',
          replyText: 'Thank you Vikram! We are happy to serve you.',
          reviewDate: new Date().toISOString(),
        },
        {
          id: 'rev-102',
          platform: platform || 'PLAYSTORE',
          authorName: 'Pooja Verma',
          authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Pooja',
          rating: 1,
          content: 'App crashed during payment processing. Please refund my failed transaction immediately.',
          sentiment: 'CRISIS',
          severity: 'CRITICAL',
          status: 'NEW',
          reviewDate: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 2,
        page: Number(page),
        limit: Number(limit),
        totalPages: 1,
      },
    },
  });
}

export async function replyToReviewHandler(req: AuthenticatedRequest, res: Response) {
  const { reviewId } = req.params;
  const { replyText } = req.body;

  if (!replyText) {
    return res.status(400).json({ success: false, error: 'Reply text is required.' });
  }

  return res.json({
    success: true,
    data: {
      reviewId,
      replyText,
      status: 'REPLIED',
      repliedAt: new Date().toISOString(),
    },
  });
}
