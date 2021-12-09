const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { fetchOrganization } = require('../utils/middleware/organizations');
const { Application } = require('../models');

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
  .post('/mine/search', fetchOrganization, async (ctx) => {
    const { body } = ctx.request;
    const { data, meta } = await Application.search({
      ...body,
    });
    ctx.body = {
      data,
      meta,
    };
  })
  .use(requirePermissions({ endpoint: 'application', permission: 'read', scope: 'global' }))
  .post('/search', validateBody(Application.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Application.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
  .use(requirePermissions({ endpoint: 'organizations', permission: 'write', scope: 'global' }))
  .post('/', validateBody(Application.getCreateValidation()), async (ctx) => {
    const application = await Application.create(ctx.request.body);
    ctx.body = {
      data: application,
    };
  })
  .patch('/:organizationId', validateBody(Application.getUpdateValidation()), async (ctx) => {
    const organization = ctx.state.organization;
    organization.assign(ctx.request.body);
    await organization.save();
    ctx.body = {
      data: organization,
    };
  })
  .delete('/:organizationId', async (ctx) => {
    await ctx.state.organization.delete();
    ctx.status = 204;
  });

module.exports = router;
