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
  }, { timestamps: true });

  const Post = model('Post', postSchema);
  return Post;
};
