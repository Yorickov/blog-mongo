export default async ({ mongoose, log }) => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
    });
    log(`Successfully connected on host ${process.env.DB_HOST}`);
  } catch (e) {
    throw e;
  }
};
