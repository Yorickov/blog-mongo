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
        const categories = await Category.find({});
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
      log(form);
      const post = await Post.findById(req.params.id);
      const initCategoryId = post.category.id;
      const newCategoryId = form.category;
      const updatedPost = updateEntity(post, form);
      try {
        await updatedPost.save();
        if (initCategoryId !== newCategoryId) {
          const newCategory = await Category.findById(newCategoryId);
          log(`newCat pre: ${newCategory.posts.length}`);
          newCategory.posts.push(updatedPost);
          log(`newCat post: ${newCategory.posts.length}`);
          await newCategory.save();
          const initCategory = await Category.findById(initCategoryId);
          log(`oldCat pre ${initCategory.posts.length}`);
          initCategory.posts.pull(post);
          log(`oldCat post: ${initCategory.posts.length}`);
          await initCategory.save();
        }
        log(`post ${updatedPost.title} updated`);
        res.flash('info', 'Post has been updated');
        res.redirect(router.namedRoutes.build('posts#show', { id: updatedPost.id }));
        return;
      } catch (e) {
        log(e);
        const categories = await Category.find({});
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
      try {
        user.posts.pull(post);
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
    })
    .get('/posts/categories/:name', 'posts/categories#show', async (req, res) => {
      const { posts } = await Category.findOne({ name: req.params.name });
      const categories = await Category.find({});
      log(`category: ${req.params.name}, posts: ${posts.length}`);
      res.render('welcome/index', { posts, categories });
    })
    .get('/posts/users/:id', 'posts/users#show', async (req, res) => {
      const { posts } = await User.findById(req.params.id);
      const categories = await Category.find({});
      log(`user: ${req.params.id}, posts: ${posts.length}`);
      res.render('welcome/index', { posts, categories });
    });
};
