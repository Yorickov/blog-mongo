import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth, isEntityExists } from '../lib/middlwares';

export default (router, container) => {
  const {
    Post,
    User,
    Category,
    log,
    mongoose,
    updateEntity,
  } = container;
  router
    .get('/posts/new', 'posts#new', reqAuth(router), async (req, res) => {
      const categories = await Category.find({});
      res.render('posts/new', { f: buildFormObj({}), categories });
    })
    .post('/posts', 'posts#create', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      const user = await User.findById(req.session.userId);
      const categories = await Category.find({});
      const category = await Category.findById(form.category);
      const post = new Post({
        ...form,
        _id: new mongoose.Types.ObjectId(),
        author: req.session.userId,
      });
      try {
        await post.save();
        user.posts.push(post);
        await user.save();
        category.posts.push(post);
        await category.save();
        log(`post ${user.posts[user.posts.length - 1].title} saved`);
        res.flash('info', 'Post has been added');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        log(e);
        res.status(422);
        res.render('posts/new', { f: buildFormObj(form, e), categories });
      }
    })
    .get('/posts/:id', 'posts#show', isEntityExists(Post), async (req, res) => {
      const post = await Post.findById(req.params.id);
      const categories = await Category.find({});
      res.render('posts/show', { post, categories });
    })
    .get('/posts/:id/edit', 'posts#edit', reqAuth(router), isEntityExists(Post), async (req, res) => {
      const post = await Post.findById(req.params.id);
      const categories = await Category.find({});
      res.render('posts/edit', { f: buildFormObj(post), post, categories });
    })
    .patch('/posts/:id/update', 'posts#update', async (req, res) => {
      const { form } = req.body;
      const post = await Post.findById(req.params.id);
      log(`post: ${post.title}`);
      const categories = await Category.find({});
      const updatedPost = updateEntity(post, form);
      const category = await Category.findById(form.category);
      // const user = await User.findById(req.session.userId);
      // const post = await Post.findById(req.params.id);
      // post.title = title;
      // post.annotation = annotation;
      // post.content = content;
      try {
        await updatedPost.save();
        log(`post: ${post.title}`);
        category.posts.pull(post);
        category.posts.push(updatedPost);
        await category.save();
        log(`post ${category.posts[category.posts.length - 1].title} updated`);
        res.flash('info', 'Post has been updated');
        res.redirect(router.namedRoutes.build('posts#show', { id: updatedPost.id }));
        return;
      } catch (e) {
        log(e);
        res.status(422);
        res.render('posts/edit', { f: buildFormObj(form, e), post: updatedPost, categories });
      }
    })
    .get('/posts/:id/destroy_edit', 'posts#destroy_edit', reqAuth(router), isEntityExists(Post), async (req, res) => {
      const post = await Post.findById(req.params.id);
      res.render('posts/destroy', { post });
    })
    .delete('/posts/:id/destroy', 'posts#destroy', reqAuth(router), isEntityExists(Post), async (req, res) => {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.session.userId);
      user.posts.pull(post.id);
      try {
        await user.save();
        await Post.findByIdAndDelete(post.id);
        res.flash('info', 'Post deleted');
        res.redirect(router.namedRoutes.build('root'));
      } catch (e) {
        log(e);
        res.status(422);
        res.flash('info', 'Post not deleted');
        res.redirect(router.namedRoutes.build('posts#show', { id: post.id }));
      }
    });
};
