import { createServer } from 'http';
import express, { NextFunction, Request, Response } from 'express';
import process from 'process';
import bodyParser from 'body-parser';
import cors from 'cors';

import TeamsRouter from './teams/TeamsRouter';
import { LocalDependencyContainer } from 'infra/dependencies/LocalDependencies';

const app = express();
const server = createServer(app);

export const serverDependencies = new LocalDependencyContainer();
serverDependencies
  .start()
  .then(() => {
    const port = 8080;

    app.use(
      cors({
        origin: ['http://localhost:3000'],
      })
    );
    app.use(bodyParser.json());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      console.error(err.stack);
      res.status(500).send('Internal Server Error');
    });

    app.use('/teams', TeamsRouter);

    app.get('/', (req, res) => {
      res.send('Hello world!');
    });

    server.listen(port, () => {
      console.log(`server started at http://localhost:${port}`);
    });

    process.on('SIGINT', () => {
      serverDependencies.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      serverDependencies.kill();
      process.exit(0);
    });
  })
  .catch(() => {
    throw new Error('Could not start server!!');
  });

export default server;
