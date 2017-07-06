/* globals twoFactor */

twoFactor.options = {};

const generateCode = () => {
  return Array(...Array(6)).map(() => {
    return Math.floor(Math.random() * 10);
  }).join('');
};

const NonEmptyString = Match.Where(x => {
  check(x, String);
  return x.length > 0;
});

const userQueryValidator = Match.Where(user => {
  check(user, {
    id: Match.Optional(NonEmptyString),
    username: Match.Optional(NonEmptyString),
    email: Match.Optional(NonEmptyString)
  });
  if (Object.keys(user).length !== 1) {
    throw new Match.Error("User property must have exactly one field");
  }
  return true;
});

const invalidLogin = () => {
  return new Meteor.Error(403, "Invalid login credentials");
};

const getFieldName = () => {
  return twoFactor.options.fieldName || 'twoFactorCode';
};

Meteor.methods({
  'twoFactor.getAuthenticationCode'(userQuery, password) {
    check(userQuery, userQueryValidator);
    check(password, String);

    const fieldName = getFieldName();

    const user = Accounts._findUserByQuery(userQuery);
    if (! user) {
      throw invalidLogin();
    }

    const checkPassword = Accounts._checkPassword(user, password);
    if (checkPassword.error) {
      throw invalidLogin();
    }

    const code = typeof twoFactor.generateCode === 'function'
      ? twoFactor.generateCode()
      : generateCode();

    if (typeof twoFactor.sendCode === 'function') {
      twoFactor.sendCode(user, code);
    }

    Meteor.users.update(user._id, {
      $set: {
        [fieldName]: code
      }
    });
  },
  'twoFactor.verifyCodeAndLogin'(options) {
    check(options, {
      user: userQueryValidator,
      password: String,
      code: String
    });

    const fieldName = getFieldName();

    const user = Accounts._findUserByQuery(options.user);
    if (! user) {
      throw invalidLogin();
    }

    const checkPassword = Accounts._checkPassword(user, options.password);
    if (checkPassword.error) {
      throw invalidLogin();
    }

    if (options.code !== user[fieldName]) {
      throw new Meteor.Error(403, "Invalid code");
    }

    Meteor.users.update(user._id, {
      $unset: {
        [fieldName]: ''
      }
    });

    return Accounts._attemptLogin(this, 'login', '', { type: '2FALogin', userId: user._id });
  },
  'twoFactor.abort'(userQuery, password) {
    check(userQuery, userQueryValidator);
    check(password, String);

    const fieldName = getFieldName();

    const user = Accounts._findUserByQuery(userQuery);
    if (! user) {
      throw invalidLogin();
    }

    const checkPassword = Accounts._checkPassword(user, password);
    if (checkPassword.error) {
      throw invalidLogin();
    }

    Meteor.users.update(user._id, {
      $unset: {
        [fieldName]: ''
      }
    });
  }
});

Accounts.validateLoginAttempt(options => {
  const customValidator = () => {
    if (typeof twoFactor.validateLoginAttempt === 'function') {
      return twoFactor.validateLoginAttempt(options);
    }
    return false;
  };

  const allowedMethods = ['createUser', 'resetPassword', 'verifyEmail'];

  if (customValidator() || options.type === 'resume' || allowedMethods.indexOf(options.methodName) !== -1) {
    return true;
  }

  return false;
});
