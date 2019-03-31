import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth } from '../lib/middlwares';

export default (router, container) => {
  const { Post, log, mongoose } = container;
  router
    .get('/posts/new', 'posts#new', reqAuth(router), (req, res) => {
      log('......');
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
    });
};
