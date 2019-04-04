import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/encrypt';
import { reqAuth, updateEntity } from '../lib/middlwares';

export default (router, container) => {
  const { User, log } = container;
  router
    .get('/account/edit', 'account#edit', reqAuth(router), async (req, res) => {
      const user = await User.findById(req.session.userId);
      res.render('account/edit', { f: buildFormObj(user) });
    })
    .get('/account/password_edit', 'account/password#edit', reqAuth(router), async (req, res) => {
      await User.findById(req.session.userId);
      res.render('account/password_edit', { f: buildFormObj({}) });
    })
    .get('/account/destroy', 'account/destroy#edit', reqAuth(router), async (req, res) => {
      await User.findById(req.session.userId);
      res.render('account/destroy', { f: buildFormObj({}) });
    })
    .patch('/account/profile', 'account/profile#update', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      log(`form: ${form.firstName} ${form.lastName}`);
      const user = await User.findById(req.session.userId);
      // user.firstName = form.firstName;
      // user.lastName = form.lastName;
      const newUser = updateEntity(user, form);
      // user.markModified('lastName');
      try {
        await newUser.save();
        log(`Profile updated to ${newUser.firstName}, ${newUser.lastName}`);
        res.flash('info', 'Profile has been updated');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        log(e);
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
        log(e);
        res.render('account/edit', { f: buildFormObj(form, e) });
      }
    })
    .patch('/account/password', 'account/password#update', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      const { password, oldPassword } = form;
      log(`form: ${oldPassword} / ${password}`);
      const user = await User.findById(req.session.userId);
      if (user.password !== encrypt(oldPassword)) {
        res.status(422);
        res.flash('info', 'Wrong current password');
        res.redirect(router.namedRoutes.build('account/password#edit'));
        return;
      }
      user.password = password ? encrypt(password) : '';
      try {
        await user.save();
        log(`Password updated to ${user.password}`);
        res.flash('info', 'Password has been updated');
        res.redirect(router.namedRoutes.build('root'));
        return;
      } catch (e) {
        log(e);
        res.render('account/password_edit', { f: buildFormObj(form, e) });
      }
    })
    .delete('/account', 'account#destroy', reqAuth(router), async (req, res) => {
      const { form } = req.body;
      const user = await User.findById(req.session.userId);
      log(`form: user.id: ${user.id}`);
      if (user.password !== encrypt(form.password)) {
        res.status(422);
        res.flash('info', 'Wrong current password');
        res.redirect(router.namedRoutes.build('account/destroy#edit'));
        return;
      }
      try {
        await User.findByIdAndDelete(user.id);
        delete req.session.userId;
        res.flash('info', 'User deleted');
        res.redirect(router.namedRoutes.build('root'));
      } catch (e) {
        log(e);
        res.render('account/destroy_edit', { formElement: buildFormObj(form, e) });
      }
    });
};
