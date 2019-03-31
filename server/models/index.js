import mongoose from 'mongoose';
import defineUser from './User';
import definePost from './Post';

const { model, Schema } = mongoose;
const User = defineUser(model, Schema);
const Post = definePost(model, Schema);

export default {
  mongoose,
  User,
  Post,
};
