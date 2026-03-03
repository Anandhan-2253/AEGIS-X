import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types';
export declare function authorize(roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map