import type { SessionRecord, User } from './domain.js';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      sessionRecord?: SessionRecord;
      currentUser?: User;
    }
  }
}

export {};
