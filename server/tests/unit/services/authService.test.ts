import bcrypt from 'bcryptjs';
import { UserRole } from '../../../src/types';

jest.mock('../../../src/repositories/userRepository', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

jest.mock('../../../src/services/tokenService', () => ({
  tokenService: {
    issueTokenPair: jest.fn(),
    rotateRefreshToken: jest.fn(),
  },
}));

jest.mock('../../../src/services/auditService', () => ({
  auditService: {
    logEvent: jest.fn(),
  },
}));

const { createUser, findUserByEmail } = jest.requireMock('../../../src/repositories/userRepository') as {
  createUser: jest.Mock;
  findUserByEmail: jest.Mock;
};

const { tokenService } = jest.requireMock('../../../src/services/tokenService') as {
  tokenService: {
    issueTokenPair: jest.Mock;
    rotateRefreshToken: jest.Mock;
  };
};
const { authService } = require('../../../src/services/authService') as typeof import('../../../src/services/authService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns tokens', async () => {
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({
      id: 'user-1',
      email: 'analyst@corp.com',
      username: 'analyst',
      role: UserRole.VIEWER,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    tokenService.issueTokenPair.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await authService.register({
      email: 'analyst@corp.com',
      username: 'analyst',
      password: 'VeryStrongPassword!123',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });

    expect(result.user.email).toBe('analyst@corp.com');
    expect(result.tokens.accessToken).toBe('access-token');
    expect(createUser).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid login credentials', async () => {
    const passwordHash = await bcrypt.hash('DifferentPassword!123', 12);
    findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'analyst@corp.com',
      username: 'analyst',
      password_hash: passwordHash,
      role: UserRole.SOC_ANALYST,
      is_active: true,
      created_at: new Date(),
    });

    await expect(
      authService.login({
        email: 'analyst@corp.com',
        password: 'WrongPassword!123',
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
