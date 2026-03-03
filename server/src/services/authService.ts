import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../repositories/userRepository';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { tokenService } from './tokenService';
import { AuditAction, UserRole } from '../types';
import { auditService } from './auditService';

class AuthService {
  async register(input: {
    email: string;
    username: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      const user = await createUser({
        email: input.email,
        username: input.username,
        passwordHash,
        role: UserRole.VIEWER,
      });

      const tokens = await tokenService.issueTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      await auditService.logEvent({
        userId: user.id,
        action: AuditAction.USER_REGISTER,
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return { user, tokens };
    } catch (error) {
      const pgError = error as { code?: string };
      if (pgError?.code === '23505') {
        throw new ConflictError('User registration conflict');
      }
      throw error;
    }
  }

  async login(input: {
    email: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const userRecord = await findUserByEmail(input.email);
    if (!userRecord || !userRecord.is_active) {
      throw new AuthenticationError('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(input.password, userRecord.password_hash);
    if (!validPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    const tokens = await tokenService.issueTokenPair({
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    await auditService.logEvent({
      userId: userRecord.id,
      action: AuditAction.USER_LOGIN,
      resourceType: 'user',
      resourceId: userRecord.id,
      details: { email: userRecord.email },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        role: userRecord.role,
        isActive: userRecord.is_active,
        createdAt: userRecord.created_at.toISOString(),
      },
      tokens,
    };
  }

  async refresh(input: {
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const rotated = await tokenService.rotateRefreshToken(input);

    await auditService.logEvent({
      userId: rotated.user.id,
      action: AuditAction.TOKEN_REFRESH,
      resourceType: 'token',
      resourceId: rotated.user.id,
      details: { role: rotated.user.role },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      user: {
        id: rotated.user.id,
        email: rotated.user.email,
        username: rotated.user.username,
        role: rotated.user.role,
        isActive: rotated.user.is_active,
        createdAt: rotated.user.created_at.toISOString(),
      },
      tokens: rotated.tokens,
    };
  }
}

export const authService = new AuthService();
