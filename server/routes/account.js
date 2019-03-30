import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth } from '../lib/middlwares';

export default (router, container) => {
  const { User, log } = container;
  router
    .get('/account/edit', 'account#edit', reqAuth(router), async (req, res) => {
      const user = await User.findById(req.session.userId);
      res.render('account/edit', { f: buildFormObj(user) });
    })
    .patch('/account/profile', 'account/profile#update', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      log(`form: ${form.firstName} ${form.lastName}`);
      const user = await User.findById(req.session.userId);
      user.firstName = form.firstName;
      user.lastName = form.lastName;
      // user.markModified('lastName');
      try {
        await user.save();
        log(`Profile updated to ${user.firstName}, ${user.lastName}`);
        res.flash('info', 'Profile has been updated');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        console.log(e);
        res.render('account/edit', { f: buildFormObj(form, e) });
      }
    })
    .patch('/account/email', 'account/email#update', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      log(`form: ${form.email}`);
      const user = await User.findById(req.session.userId);
      user.email = form.email;
      try {
        await user.save();
        log(`Email updated to ${user.email}`);
        res.flash('info', 'Email has been updated');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        res.render('account/edit', { f: buildFormObj(form, e) });
      }
    });
};
