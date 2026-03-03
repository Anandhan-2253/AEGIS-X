import { Request, Response } from 'express';
import { authService } from '../services/authService';

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? '0.0.0.0';
}

function userAgent(req: Request): string {
  return req.headers['user-agent'] ?? 'unknown';
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      ipAddress: clientIp(req),
      userAgent: userAgent(req),
    });

    res.status(201).json({
      success: true,
      data: result,
      requestId: req.requestId,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
      ipAddress: clientIp(req),
      userAgent: userAgent(req),
    });

    res.status(200).json({
      success: true,
      data: result,
      requestId: req.requestId,
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const result = await authService.refresh({
      refreshToken: req.body.refreshToken,
      ipAddress: clientIp(req),
      userAgent: userAgent(req),
    });

    res.status(200).json({
      success: true,
      data: result,
      requestId: req.requestId,
    });
  },
};
