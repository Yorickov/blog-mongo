export default (router, container) => {
  const {
    Category,
    log,
  } = container;
  router
    .get('/categories/:name', 'categories#show', async (req, res) => {
      const category = await Category.findOne({ name: req.params.name });
      const categories = await Category.find({});
      const { posts } = category;
      log(`category: ${category}: posts: ${posts}`);
      res.render('welcome/index', { posts, categories });
    });
};
