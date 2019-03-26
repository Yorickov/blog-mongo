export default router => (
  router.get('/', 'root', (req, res) => {
    res.render('welcome/index');
  }));
