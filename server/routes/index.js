import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import account from './account';
import posts from './posts';

const controllers = [welcome, users, sessions, account, posts];

export default (router, container) => (
  controllers.forEach(controller => controller(router, container)));
