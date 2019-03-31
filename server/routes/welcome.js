export default (router, container) => {
  const { Post } = container;
  router
    .get('/', 'root', async (req, res) => {
      const posts = await Post.find({});
      res.render('welcome/index', { posts });
    });
};
