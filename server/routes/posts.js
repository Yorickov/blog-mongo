import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth, isEntityExists } from '../lib/middlwares';

const getTags = str => str
  .split(',')
  .map(item => item.trim().toLowerCase())
  .filter(item => item);

export default (router, container) => {
  const {
    Post,
    User,
    Category,
    Tag,
    log,
    mongoose,
    updateEntity,
  } = container;

  const processTags = async (post, tags) => {
    await Promise.all(tags.map(async (tag) => {
      let item = await Tag.findOne({ name: tag });
      if (!item) {
        item = await Tag.create({ _id: new mongoose.Types.ObjectId(), name: tag });
      }
      await post.tags.push(item);
      await item.posts.push(post);
      await item.save();
    }));
  };
  const deleteTags = async (post) => {
    const tagIds = post.tags.toObject().map(obj => obj.id);
    log(`tag is: ${tagIds}`);
    post.tags.splice(0, post.tags.length);
    await post.save();
    await Promise.all(tagIds.map(async (id) => {
      const tag = await Tag.findById(id);
      tag.posts.pull(post);
      await tag.save();
    }));
  };

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
      if (form.tagsIn) {
        const tags = getTags(form.tagsIn);
        await processTags(post, tags);
      }
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
        log(`err on post creation: ${e}`);
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
      post.tagsIn = post.tags.toObject().map(obj => obj.name).join(', ');
      const categories = await Category.find({});
      res.render('posts/edit', { f: buildFormObj(post), post, categories });
    })
    .patch('/posts/:id/update', 'posts#update', async (req, res) => {
      const { form } = req.body;
      const post = await Post.findById(req.params.id);
      const initCategoryId = post.category.id;
      const newCategoryId = form.category;
      const updatedPost = updateEntity(post, form);
      log(`pre${post.tags}`);
      await deleteTags(post);
      log(`post${post.tags}`);
      if (form.tagsIn) {
        const tags = getTags(form.tagsIn);
        await processTags(post, tags);
      }
      try {
        await updatedPost.save();
        if (initCategoryId !== newCategoryId) {
          const newCategory = await Category.findById(newCategoryId);
          newCategory.posts.push(updatedPost);
          await newCategory.save();
          const initCategory = await Category.findById(initCategoryId);
          initCategory.posts.pull(post);
          await initCategory.save();
        }
        log(`post ${updatedPost.title} updated`);
        res.flash('info', 'Post has been updated');
        res.redirect(router.namedRoutes.build('posts#show', { id: updatedPost.id }));
        return;
      } catch (e) {
        log(`err on post update: ${e}`);
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
        await deleteTags(post);
        user.posts.pull(post);
        await user.save();
        await Post.findByIdAndDelete(post.id);
        res.flash('info', 'Post deleted');
        res.redirect(router.namedRoutes.build('root'));
      } catch (e) {
        log(`err on post destroy: ${e}`);
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
    })
    .get('/posts/tags/:id', 'posts/tags#show', async (req, res) => {
      const { posts } = await Tag.findById(req.params.id);
      const categories = await Category.find({});
      log(`tag: ${req.params.id}, posts: ${posts.length}`);
      res.render('welcome/index', { posts, categories });
    });
};
