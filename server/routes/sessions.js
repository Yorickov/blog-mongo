import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/encrypt';
import { reqAuth } from '../lib/middlwares';

export default (router, container) => {
  const { User, log } = container;
  router
    .get('/sessions/new', 'sessions#new', (req, res) => {
      res.render('sessions/new', { f: buildFormObj({}) });
    })
    .post('/sessions', 'sessions#create', async (req, res) => {
      const { form: { email, password } } = req.body;
      const user = await User.findOne({ email });
      if (user && user.password === encrypt(password)) {
        req.session.userId = user.id;
        req.session.userProfileName = user.fullName;
        log(`user sign-in: ${user.id}: ${user.fullName}`);
        res.flash('info', 'You are authorized');
        res.redirect(router.namedRoutes.build('root'));
        return;
      }
      res.status(422);
      const err = { errors: [{ path: 'password', message: 'Wrong email or password' }] };
      res.render('sessions/new', { f: buildFormObj({ email }, err) });
    })
    .delete('/sessions', 'sessions#destroy', reqAuth(router), (req, res) => {
      delete req.session.userId;
      res.flash('info', 'See you');
      res.redirect(router.namedRoutes.build('root'));
    });
};
