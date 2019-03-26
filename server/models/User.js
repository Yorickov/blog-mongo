export default (mongoose, Schema) => {
  const userSchema = new Schema({
    nickname: String,
    password: String,
  });
  const User = mongoose.model('User', userSchema);
  return User;
};
