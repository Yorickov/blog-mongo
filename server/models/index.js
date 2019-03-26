import mongoose from 'mongoose';
import defineUser from './User';

const User = defineUser(mongoose, mongoose.Schema);

export default {
  mongoose,
  User,
};
