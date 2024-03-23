const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { router } = require('express-file-routing');
const path = require('path');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const ip = require('@/src/utils/middlewares/ip');

const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
module.exports = class Server {
  constructor() {
    return this;
  }

  create() {
    this.server = express();

    this.server.set('trust proxy', config.trustProxy);
    this.server.disable('x-powered-by');
    this.server.disable('etag');

    logger.send('Server created.');
    return this;
  }

  async start(port = 8000) {
    this.addMiddlewares();
    this.configureSessions();
    this.createDiscordAuth();

    this.server.use('/', await router({ directory: path.join(__dirname, 'routes') }));
    this.server.get('/favicon.ico', (request, response) => response.sendFile(path.join(__dirname, '..', 'public', 'favicon.ico')));
    this.server.use('*', (request, response) => response.sendError('Not Found', 404));

    this.listen(port);
  }

  listen(port) {
    this.server.listen(port, () => logger.send(`Server listening on port ${port}.`));
  }

  addMiddlewares() {
    this.server.use(cookieParser(process.env.COOKIE_SECRET));
    this.server.use(cors({
      origin: config.corsOrigin,
      credentials: true
    }));
    this.server.use(helmet({
      xXssProtection: false,
      xPoweredBy: false,
      xFrameOptions: { action: 'sameorigin' },
    }));
    this.server.use(ip);
    this.server.use(require('@/src/utils/middlewares/error'));
    this.server.use(require('@/src/utils/middlewares/logger'));
    this.server.use(require('@/src/utils/middlewares/ensureClientIsReady'));
    
    logger.send('Middlewares added.');
  }

  configureSessions() {
    const store = MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: 'api',
      touchAfter: 24 * 3600,
      crypto: {
        secret: process.env.SESSION_STORE_SECRET
      }
    });

    this.server.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        domain: process.env.NODE_ENV === 'production' ? new URL(config.frontendUrl).hostname : 'localhost',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    }));
  }

  createDiscordAuth() {
    const Strategy = new DiscordStrategy({
      clientID: config.discordClientId,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: '/auth/callback',
      scope: config.discordScopes
    }, (accessToken, refreshToken, profile, done) => process.nextTick(async () => {
      done(null, profile);
    }));

    Strategy.authorizationParams = () => ({ prompt: 'none' });

    passport.use(Strategy);

    this.server.use(passport.initialize());
    this.server.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    global.passport = passport;

    this.server.use('*', (request, response, next) => {
      if (!request.user && request.session?.passport?.user) request.user = request.session.passport.user;
      next();
    });

    this.server.use('*', (request, response, next) => {
      if (request.user) request.member = client.guilds.cache.get(config.guildId).members.cache.get(request.user.id);
      next();
    });
  }
};