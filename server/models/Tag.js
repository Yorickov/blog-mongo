export default (model, Schema) => {
  const tagSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
      unique: true,
      maxLength: [50, 'Can not be more then 50 symbols'],
      trim: true,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post', autopopulate: true }],
  }, { timestamps: true });

  tagSchema.plugin(require('mongoose-autopopulate')); // eslint-disable-line

  const Tag = model('Tag', tagSchema);
  return Tag;
};
