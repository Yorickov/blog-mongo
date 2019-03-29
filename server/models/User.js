export default (model, Schema) => {
  const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    firstName: {
      type: String,
      trim: true,
      required: [true, 'Can not be empty'],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'Can not be empty'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      index: { unique: true },
      required: [true, 'Can not be empty'],
      match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'Fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Can not be empty'],
    },
    // posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  }, { timestamps: true });

  userSchema
    .virtual('fullName')
    .get(function () { // eslint-disable-line
      return `${this.firstName} ${this.lastName}`;
    });

  const User = model('User', userSchema);
  return User;
};
