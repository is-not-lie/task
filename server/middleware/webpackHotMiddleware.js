const hotMiddleware = require('webpack-hot-middleware')

module.exports = (compiler, options = {}) => {
  const middleware = hotMiddleware(compiler, options);

  const koaMiddleware = async (ctx, next) => {
    const { req, res } = ctx;
    const { end: originalEnd } = res;
    const runNext = await new Promise((resolve) => {
      res.end = function end() {
        originalEnd.apply(this, arguments);
        resolve(0);
        return this;
      };
      middleware(req, res, () => {
        resolve(1);
      });
    });
    if (runNext) await next();
  };
  return koaMiddleware;
};
