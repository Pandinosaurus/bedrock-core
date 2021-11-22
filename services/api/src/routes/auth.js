const Router = require('@koa/router');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { createAuthToken, createTemporaryToken, generateTokenId } = require('../utils/tokens');
const { sendTemplatedMail } = require('../utils/mailer');
const mfa = require('../utils/mfa');
const { generateHumanCode } = require('../utils/codes');
const { User, Invite, AuditEntry } = require('../models');

const router = new Router();

const passwordField = Joi.string()
  .min(12)
  .message('Your password must be at least 12 characters long. Please try another.');

async function handleMfaChallengeResponse(ctx, user) {
  const tokenId = generateTokenId();
  const mfaToken = createTemporaryToken({ type: 'mfa', sub: user.id, jti: tokenId });
  user.tempTokenId = tokenId;
  await user.save();
  ctx.body = {
    data: {
      mfaToken,
      mfaRequired: true,
      mfaMethod: user.mfaMethod,
      mfaPhoneNumber: user.mfaPhoneNumber?.slice(-4),
    },
  };
}

router
  .post(
    '/register',
    validateBody({
      email: Joi.string().lowercase().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: passwordField.required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ctx.throw(400, 'A user with that email already exists');
      }

      const authTokenId = generateTokenId();
      const user = await User.create({
        authTokenId,
        ...ctx.request.body,
      });

      await AuditEntry.append('registered', ctx, {
        object: user,
        user: user.id,
      });

      await sendTemplatedMail({
        to: user.name,
        template: 'welcome.md',
        subject: 'Welcome to {{appName}}',
      });

      ctx.body = { data: { token: createAuthToken(user.id, authTokenId) } };
    }
  )
  .post(
    '/login/email',
    validateBody({
      email: Joi.string().email().trim().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(400, 'Unknown email address.');
      }

      const code = generateHumanCode(6);
      user.emailAuthOtp = code;
      user.emailAuthOtpIssuedAt = new Date();
      await user.save();
      console.log(code);
      const formattedCode = `${code.slice(0, 3)}-${code.slice(3, 6)}`;
      await sendTemplatedMail({
        to: [user.name, email].join(' '),
        template: 'login-with-email.md',
        subject: `{{appName}} confirmation code: ${formattedCode}`,
        code: formattedCode,
      });
      ctx.status = 204;
    }
  )
  .post(
    '/login/email/confirm',
    validateBody({
      token: Joi.string().email().trim().required(),
      code: Joi.string().required().trim(),
    }),
    async (ctx) => {
      const { email, code } = ctx.request.body;
      const user = await User.findOneAndUpdate(
        { email },
        {
          lastLoginAttemptAt: new Date(),
          $inc: { loginAttempts: 1 },
        }
      );

      if (!user.verifyLoginAttempts()) {
        await AuditEntry.append('reached max authentication attempts', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, 'Too many login attempts');
      }

      if (user.emailAuthOtpIssuedAt < Date.now() - 30 * 1000 * 60) {
        return ctx.throw(400, 'Please request a new code');
      }

      if (user.emailAuthOtp !== code) {
        await AuditEntry.append('failed ', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        return ctx.throw(401, 'Code is not valid');
      }

      user.loginAttempts = 0;

      if (await mfa.requireChallenge(ctx, user)) {
        return handleMfaChallengeResponse(ctx, user);
      }

      const authTokenId = generateTokenId();
      user.authTokenId = authTokenId;
      user.accessConfirmedAt = new Date();
      await user.save();

      ctx.body = { data: { token: createAuthToken(user.id, user.authTokenId) } };
    }
  )
  .post(
    '/login',
    validateBody({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOneAndUpdate(
        { email },
        {
          lastLoginAttemptAt: new Date(),
          $inc: { loginAttempts: 1 },
        }
      );

      if (!user) {
        ctx.throw(401, 'Incorrect password');
      }

      if (!user.verifyLoginAttempts()) {
        await AuditEntry.append('reached max authentication attempts', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, 'Too many login attempts');
      }

      if (!(await user.verifyPassword(password))) {
        await AuditEntry.append('failed authentication', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(401, 'Incorrect password');
      }

      user.loginAttempts = 0;

      if (await mfa.requireChallenge(ctx, user)) {
        return handleMfaChallengeResponse(ctx, user);
      }

      const authTokenId = generateTokenId();
      user.authTokenId = authTokenId;
      user.accessConfirmedAt = new Date();
      await user.save();

      await AuditEntry.append('successfully authenticated', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = { data: { token: createAuthToken(user.id, user.authTokenId) } };
    }
  )
  .post(
    '/confirm-access',
    validateBody({
      password: Joi.string(),
    }),
    authenticate({ type: 'user' }),
    fetchUser,
    async (ctx) => {
      const { authUser } = ctx.state;
      const { password } = ctx.request.body;

      if (!authUser.verifyLoginAttempts()) {
        await AuditEntry.append('reached max authentication attempts', ctx, {
          type: 'security',
          object: authUser,
          user: authUser.id,
        });
        ctx.throw(401, 'Too many attempts');
      }

      if (!(await authUser.verifyPassword(password))) {
        await AuditEntry.append('failed authentication (confirm-access)', ctx, {
          type: 'security',
          object: authUser,
          user: authUser.id,
        });
        ctx.throw(401, 'Incorrect password');
      }
      authUser.accessConfirmedAt = new Date();
      await authUser.save();

      ctx.status = 204;
    }
  )
  .post('/logout', authenticate({ type: 'user' }), fetchUser, async (ctx) => {
    const user = ctx.state.authUser;
    await user.updateOne({
      $unset: {
        authTokenId: true,
      },
    });
    ctx.status = 204;
  })
  .post(
    '/accept-invite',
    validateBody({
      name: Joi.string().required(),
      password: passwordField.required(),
    }),
    authenticate({ type: 'invite' }),
    async (ctx) => {
      const { name, password } = ctx.request.body;
      const invite = await Invite.findByIdAndUpdate(ctx.state.jwt.inviteId, {
        $set: { status: 'accepted' },
      });
      if (!invite) {
        return ctx.throw(400, 'Invite could not be found');
      }
      const authTokenId = generateTokenId();
      const existingUser = await User.findOne({ email: invite.email });

      if (existingUser) {
        await existingUser.updateOne({ authTokenId });
        ctx.body = { data: { token: createAuthToken(existingUser.id, authTokenId) } };
        return;
      }

      const user = await User.create({
        name,
        email: invite.email,
        password,
        authTokenId,
      });

      await AuditEntry.append('registered', ctx, {
        object: user,
        user: user.id,
      });

      ctx.body = { data: { token: createAuthToken(user.id, authTokenId) } };
    }
  )
  .post(
    '/request-password',
    validateBody({
      email: Joi.string().email().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(400, 'Unknown email address.');
      }

      const tokenId = generateTokenId();
      const token = createTemporaryToken({ type: 'password', sub: user.id, jti: tokenId });
      await user.updateOne({ tempTokenId: tokenId });

      await sendTemplatedMail({
        to: [user.name, email].join(' '),
        template: 'reset-password.md',
        subject: 'Password Reset Request',
        token,
        email,
      });

      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validateBody({
      password: passwordField.required(),
    }),
    authenticate({ type: 'password' }),
    async (ctx) => {
      const { jwt } = ctx.state;
      const { password } = ctx.request.body;
      const user = await User.findById(jwt.sub);
      if (!user) {
        ctx.throw(400, 'User does not exist');
      } else if (user.tempTokenId !== jwt.jti) {
        await AuditEntry.append('attempted reset password', ctx, {
          type: 'security',
          object: user,
          user: user.id,
        });
        ctx.throw(400, 'Token is invalid (jti)');
      }
      user.password = password;
      user.tempTokenId = undefined;

      await user.save();

      await AuditEntry.append('reset password', ctx, {
        object: user,
        user: user.id,
      });
      ctx.body = { data: { token: createAuthToken(user.id) } };
    }
  );

module.exports = router;
