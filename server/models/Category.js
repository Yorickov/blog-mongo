export default (model, Schema) => {
  const categorySchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
      trim: true,
      maxLength: [50, 'Can not be more then 50 symbols'],
      unique: true,
      index: { unique: true },
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post', autopopulate: true }],
  }, { timestamps: true });

  categorySchema.plugin(require('mongoose-autopopulate')); // eslint-disable-line

  const Category = model('Category', categorySchema);
  return Category;
};
