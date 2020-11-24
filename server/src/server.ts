import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';

import { createConnection } from 'typeorm';

import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';

import HelloResolver from './resolvers/hello';
import PostResolver from './resolvers/posts';
import UserResolver from './resolvers/users';
import __prod__ from './constants';

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // createConnection method will automatically read connection options
  // from your ormconfig file or environment variables
  await createConnection();

  // order matters, we'll be using session inside apollo by req and res
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: 'mysecrethere',
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.use((request: Request, response: Response, _: NextFunction) => {
    return response.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  });

  app.listen(5000, () => {
    console.log('🚀 Running at localhost:5000');
  });
};

startServer().catch((err: Error) => {
  console.log(err);
});
