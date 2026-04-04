import session from 'express-session';
import MongoStore from 'connect-mongo';
import env from './environement';

export const sessionConfig = session({
  secret: env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: env.SESSION_MAX_AGE / 1000
  }),
  cookie: {
    maxAge: env.SESSION_MAX_AGE,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});
