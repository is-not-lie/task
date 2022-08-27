const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const connect = require('koa2-connect')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { historyApiFallback } = require('koa2-connect-history-api-fallback')
const webpackConfig = require('../webpack.config')
const webpackDevMiddleware = require('./middleware/webpackDevMiddleware')
const webpackHotMiddleware = require('./middleware/webpackHotMiddleware')

const app = new Koa()
const router = new KoaRouter()
const port = 3000
const logger = console.log

app.use(historyApiFallback())
app.use(koaStatic(webpackConfig.output.path))

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const compiler = webpack(webpackConfig)
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(webpackHotMiddleware(compiler, {
    log: false,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))
}

router.all(/^\/common\/proxy\/*/, async (ctx, next) => {
  const urlMatch = ctx.url.match(/^\/common\/proxy\/(.+)/);
  const path = urlMatch?.[1];
  const host = 'https://api.exchangerate.host'
  console.log('`${host}/${path}` => ', `${host}/${path}`)
  const request = connect(
    createProxyMiddleware({
      target: `${host}/${path}`,
      changeOrigin: true,
      ws: true,
    })
  );
  request(ctx, next);
})

app.use(router.allowedMethods())
app.use(router.routes())
app.use(koaBody({ multipart: true }))

app.listen(port, () => logger(`🚀 ~~~ server running in ${port}`))
