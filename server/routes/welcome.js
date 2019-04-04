export default (router, container) => {
  const { Post, Category } = container;
  router
    .get('/', 'root', async (req, res) => {
      const posts = await Post.find({});
      const categories = await Category.find({});
      res.render('welcome/index', { posts, categories });
    });
};
