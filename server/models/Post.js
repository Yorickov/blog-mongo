export default (model, Schema) => {
  const postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: {
      type: String,
      trim: true,
      maxLength: [100, 'Can not be more then 100 symbols'],
      required: [true, 'Can not be empty'],
    },
    annotation: {
      type: String,
      trim: true,
      maxLength: [200, 'Can not be more then 300 symbols'],
    },
    content: {
      type: String,
      trim: true,
      required: [true, 'Can not be empty'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      autopopulate: true,
    },
  }, { timestamps: true });

  postSchema.plugin(require('mongoose-autopopulate')); // eslint-disable-line

  const Post = model('Post', postSchema);
  return Post;
};
