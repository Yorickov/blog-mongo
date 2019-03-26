import dotenv from 'dotenv';
import log from './lib/log';
import models from './models';

dotenv.config();

export default { log, ...models };
