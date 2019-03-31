import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth, isEntityExists } from '../lib/middlwares';

export default (router, container) => {
  const { Post, log, mongoose } = container;
  router
    .get('/posts/new', 'posts#new', reqAuth(router), (req, res) => {
      const post = {};
      res.render('posts/new', { f: buildFormObj(post) });
    })
    .post('/posts', 'posts#create', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      const post = new Post({ ...form, _id: new mongoose.Types.ObjectId() });
      try {
        await post.save();
        log(`post ${post.title} saved`);
        res.flash('info', 'Post has been added');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        res.status(422);
        res.render('posts/new', { f: buildFormObj(form, e) });
      }
    })
    .get('/posts/:id', 'posts#show', isEntityExists(Post), async (req, res) => {
      const post = await Post.findById(req.params.id);
      res.render('posts/show', { post });
    });
};
