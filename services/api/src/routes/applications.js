const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Application } = require('../models');
const { kebabCase } = require('lodash');
const Joi = require('joi');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('application', async (id, ctx, next) => {
    const application = await Application.findById(id);
    ctx.state.application = application;
    if (!application) {
      ctx.throw(404);
    }
    return next();
  })
  .post('/mine/search', async (ctx) => {
    const { body } = ctx.request;
    const { data, meta } = await Application.search({
      user: ctx.state.authUser.id,
      ...body,
    });
    ctx.body = {
      data,
      meta,
    };
  })
  .post('/', validateBody(Application.getCreateValidation()), async (ctx) => {
    const { body } = ctx.request;
    const clientId = kebabCase(body.name);
    const count = await Application.count({
      clientId,
    });

    const application = await Application.create({
      ...body,
      clientId: count ? `${clientId}-${count}` : clientId, // needs to be generated
      user: ctx.state.authUser,
    });

    ctx.body = {
      data: application,
    };
  })
  .patch(
    '/:application',
    validateBody(
      Application.getUpdateValidation({
        clientId: Joi.strip(),
        requestCount: Joi.strip(),
      })
    ),
    async (ctx) => {
      const application = ctx.state.application;
      application.assign(ctx.request.body);
      await application.save();
      ctx.body = {
        data: application,
      };
    }
  )
  .delete('/:application', async (ctx) => {
    await ctx.state.application.delete();
    ctx.status = 204;
  });

module.exports = router;
