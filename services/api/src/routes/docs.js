const Router = require('@koa/router');
const { set } = require('lodash');

const { loadDefinition, saveDefinition, generateDefinition } = require('../utils/openapi');

const router = new Router();

router
  .get('/', async (ctx) => {
    const definition = await loadDefinition();
    ctx.body = {
      data: definition,
    };
  })
  .patch('/', async (ctx) => {
    const { path, value } = ctx.request.body;
    const definition = await loadDefinition();
    if (!path) {
      ctx.throw(400, 'Path required.');
    } else if (value == null) {
      ctx.throw(400, 'Value required.');
    }
    set(definition, path, value);
    await saveDefinition(definition);
    ctx.status = 204;
  })
  .post('/generate', async (ctx) => {
    ctx.body = {
      data: await generateDefinition(),
    };
  });

module.exports = router;
