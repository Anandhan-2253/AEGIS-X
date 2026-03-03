import { NextFunction, Request, RequestHandler, Response } from 'express';
export declare const asyncHandler: (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map