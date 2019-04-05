import dotenv from 'dotenv';
import log from './lib/log';
import models from './models';
import updateEntity from './lib/utils';

dotenv.config();

export default {
  log,
  updateEntity,
  ...models,
};
