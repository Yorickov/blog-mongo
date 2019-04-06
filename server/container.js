import dotenv from 'dotenv';
import log from './lib/log';
import models from './models';
import updateEntity from './lib/updateEntity';

dotenv.config();

export default {
  log,
  updateEntity,
  ...models,
};
