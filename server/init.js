export default async ({ mongoose, log, Category }) => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
    });
    const categories = await Category.find({});
    if (categories.length < 1) {
      await Category.create(
        { _id: mongoose.Types.ObjectId(), name: 'business' },
        { _id: mongoose.Types.ObjectId(), name: 'health' },
        { _id: mongoose.Types.ObjectId(), name: 'entertainment' },
        { _id: mongoose.Types.ObjectId(), name: 'sport' },
        { _id: mongoose.Types.ObjectId(), name: 'culture' },
      );
    }
    log(`Successfully connected on host ${process.env.DB_HOST}`);
  } catch (e) {
    throw e;
  }
};
