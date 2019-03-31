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
      maxLength: [10000, 'Can not be more then 10000 symbols'],
    },
  }, { timestamps: true });

  const Post = model('Post', postSchema);
  return Post;
};
