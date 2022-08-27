const devMiddleware = require('webpack-dev-middleware');

module.exports = (compiler, options = {}) => {
  const expressMiddleware = devMiddleware(compiler, options);

  const koaMiddleware = async (ctx, next) => {
    const { req, res } = ctx;
    const locals = ctx.locals || ctx.state;

    const runNext = await new Promise((resolve) => {
      expressMiddleware(
        req,
        {
          ...res,
          locals,
          end(body) {
            ctx.body = body;
            resolve(0);
          },
          setHeader(field, value) {
            ctx.set(field, value);
            return this;
          },
          getHeader(field) {
            return ctx.get(field);
          },
        },
        () => {
          resolve(1);
        }
      );
    });

    if (runNext) await next();
  };

  Object.keys(expressMiddleware).forEach((key) => {
    Object.assign(koaMiddleware, {
      [key]: expressMiddleware[key],
    });
  });

  return koaMiddleware;
};
