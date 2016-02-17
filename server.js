/* globals twoFactor */

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

Meteor.methods({
  'twoFactor.getAuthenticationCode'(userQuery, password) {
    check(userQuery, userQueryValidator);
    check(password, String);

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
        twoFactorCode: code
      }
    });
  },
  'twoFactor.verifyCodeAndLogin'(options) {
    check(options, {
      user: userQueryValidator,
      password: String,
      code: String
    });

    const user = Accounts._findUserByQuery(options.user);
    if (! user) {
      throw invalidLogin();
    }

    const checkPassword = Accounts._checkPassword(user, options.password);
    if (checkPassword.error) {
      throw invalidLogin();
    }

    if (options.code !== user.twoFactorCode) {
      throw new Meteor.Error(403, "Invalid code");
    }

    Meteor.users.update(user._id, {
      $unset: {
        twoFactorCode: ''
      }
    });

    return Accounts._loginUser(this, user._id);
  }
});

Accounts.validateLoginAttempt(options => {
  let valid = false;
  if (typeof twoFactor.validateLoginAttempt === 'function') {
    valid = twoFactor.validateLoginAttempt(options);
  }
  if (options.type === 'resume' || valid) {
    return true;
  }
});
