import assert from 'assert';

const flashFn = () => (req, res, next) => {
  assert(req.session, 'a req.session is required!');
  res.locals.flash = req.session.flash || [];
  req.session.flash = [];
  res.flash = (type, message) => {
    req.session.flash.push({ type, message });
  };
  next();
};

const reqAuth = router =>
  (req, res, next) => { // eslint-disable-line
    if (!res.locals.currentUserId) {
      res.flash('info', 'Session time expired, relogin please');
      res.redirect(router.namedRoutes.build('session#new'));
      return;
    }
    next();
  };

const isEntityExists = Model => (
  async (req, res, next) => {
    try {
      await Model.findById(req.params.id);
      next();
    } catch (e) {
      res.status(404);
      res.render('errors/404');
    }
  });

export { flashFn, reqAuth, isEntityExists };
