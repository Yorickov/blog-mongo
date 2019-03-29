import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/encrypt';
import { isEntityExists } from '../lib/middlwares';

export default (router, container) => {
  const { User, log } = container;
  router
    .get('/users/new', 'users#new', (req, res) => {
      const user = {};
      res.render('users/new', { f: buildFormObj(user) });
    })
    .post('/users', 'users#create', async (req, res) => {
      const { form } = req.body;
      const password = form.password ? encrypt(form.password) : '';
      const user = new User({
        ...form,
        password,
        _id: new container.mongoose.Types.ObjectId(),
      });
      try {
        await user.save();
        log(`add user: ${user}`);
        res.flash('info', 'User has been created');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        res.status(422);
        res.render('users/new', { f: buildFormObj(form, e) });
      }
    })
    .get('/users/:id', 'users#show', isEntityExists(User), async (req, res) => { // reqEntityExists(router, User)
      const user = await User.findById(req.params.id);
      log(`user: ${user}`);
      res.render('users/show', { user });
    });
};
