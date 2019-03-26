export default async ({ mongoose: { connect }, log }) => {
  try {
    await connect(process.env.DB_HOST, {
      useNewUrlParser: true,
    });
    log(`Successfully connected on host ${process.env.DB_HOST}`);
  } catch (e) {
    throw e;
  }
};
