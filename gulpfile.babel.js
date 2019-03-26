import { series } from 'gulp';
import app from './server';

const server = async () => {
  const PORT = process.env.PORT || 3000;
  app().listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
};

const start = series(server);

export { start }; // eslint-disable-line
