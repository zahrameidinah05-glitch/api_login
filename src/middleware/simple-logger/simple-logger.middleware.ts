import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class SimpleLoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction) {
    console.log(`Request masuk method: ${req.method}, url: ${req.url}`);
    next();
  }
}


