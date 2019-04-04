export default (model, Schema) => {
  const commentSchema = new Schema({
    _id: Schema.Types.ObjectId, // ???
    content: {
      type: String,
      trim: true,
      maxLength: [1000, 'Can not be more then 1000 symbols'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      autopopulate: true,
    },
  }, { timestamps: true });

  commentSchema.plugin(require('mongoose-autopopulate')); // eslint-disable-line

  const Comment = model('Comment', commentSchema);
  return Comment;
};
