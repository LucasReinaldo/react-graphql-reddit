import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';

import { createConnection } from 'typeorm';

import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import HelloResolver from './resolvers/hello';
import PostResolver from './resolvers/posts';

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // createConnection method will automatically read connection options
  // from your ormconfig file or environment variables
  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
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
