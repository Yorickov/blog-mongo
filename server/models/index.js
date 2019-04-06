import mongoose from 'mongoose';
import defineUser from './User';
import definePost from './Post';
import defineCategory from './Category';
import defineComment from './Comment';
import defineTag from './Tag';

const { model, Schema } = mongoose;
const User = defineUser(model, Schema);
const Post = definePost(model, Schema);
const Category = defineCategory(model, Schema);
const Comment = defineComment(model, Schema);
const Tag = defineTag(model, Schema);
export default {
  mongoose,
  User,
  Post,
  Category,
  Comment,
  Tag,
};
