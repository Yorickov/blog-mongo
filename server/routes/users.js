import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/encrypt';
import { isEntityExists } from '../lib/middlwares';

export default (router, container) => {
  const { User, log, mongoose } = container;
  router
    .get('/users/new', 'users#new', (req, res) => {
      res.render('users/new', { f: buildFormObj({}) });
    })
    .post('/users', 'users#create', async (req, res) => {
      const { form } = req.body;
      const password = form.password ? encrypt(form.password) : '';
      const user = new User({ ...form, password, _id: new mongoose.Types.ObjectId() });
      try {
        await user.save();
        log(`add user: ${user.email}`);
        res.flash('info', 'User has been created');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        log(e);
        res.status(422);
        res.render('users/new', { f: buildFormObj(form, e) });
      }
    })
    .get('/users/:id', 'users#show', isEntityExists(User), async (req, res) => {
      const user = await User.findById(req.params.id);
      log(`profile user_id: ${user.id}`);
      res.render('users/show', { user });
    });
};
