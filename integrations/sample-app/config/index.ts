import app from './app.js';
import auth from './auth.js';
import logger from './logger.js';
import storage from './storage.js';
import localization from './localization.js';
import mailer from './mailer.js';
import database from './database.js';
import cache from './cache.js';
import queue from './queue.js';
import http from './http.js';

export default [
  http,
  app,
  auth,
  cache,
  database,
  localization,
  logger,
  mailer,
  queue,
  storage,
];
