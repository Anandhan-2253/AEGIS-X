import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

export function authorize(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Authentication context missing'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError(`Role ${req.user.role} cannot access this endpoint`));
      return;
    }

    next();
  };
}
