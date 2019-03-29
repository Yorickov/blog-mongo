import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth } from '../lib/middlwares';

export default (router, container) => {
  const { User, log } = container;
  router
    .get('/account/edit', 'account#edit', reqAuth(router), async (req, res) => { // reqAuth(router)
      const user = await User.findById(req.session.userId);
      log(`user: ${user}`);
      res.render('account/edit', { f: buildFormObj(user) });
    });
};
