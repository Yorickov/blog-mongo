import { series } from 'gulp';
import app from './server';
import container from './server/container';
import init from './server/init';

const initModels = async () => await init(container); // eslint-disable-line

const server = async () => {
  const PORT = process.env.PORT || 3000;
  app().listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
};

const start = series(initModels, server);

export { start }; // eslint-disable-line
