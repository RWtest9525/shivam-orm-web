import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  // Pre-seed demo users fallback logic for development / standalone execution
  const normalizedEmail = email.toLowerCase().trim();
  let role: 'SUPER_ADMIN' | 'COMPANY_OWNER' | 'COMPANY_ADMIN' | 'MANAGER' | 'SUPPORT_AGENT' | 'EMPLOYEE' | 'VIEWER' = 'COMPANY_OWNER';
  let companyId: string | null = 'company-demo-1';
  let companyName = 'Demonstration Agency Client';

  if (normalizedEmail === 'shivam@equinoxmarketingagency.in' || normalizedEmail.includes('admin')) {
    role = 'SUPER_ADMIN';
    companyId = null;
    companyName = 'Equinox Pulse Master Admin';
  }

  const payload = {
    id: `user-${Date.now()}`,
    email: normalizedEmail,
    role,
    companyId,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });

  return res.json({
    success: true,
    data: {
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        companyName,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };
    const newAccessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    const newRefreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
}

export async function meHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthenticated.' });
  }
  return res.json({
    success: true,
    data: req.user,
  });
}
