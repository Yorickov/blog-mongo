import mongoose from 'mongoose';
import defineUser from './User';

const { model, Schema } = mongoose;
const User = defineUser(model, Schema);

export default {
  mongoose,
  User,
};
