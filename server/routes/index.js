import welcome from './welcome';

const controllers = [welcome];

export default (router, container) => (
  controllers.forEach(controller => controller(router, container)));
