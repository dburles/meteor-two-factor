/* globals twoFactor */

const state = new ReactiveDict('twoFactor');

state.set('user', '');
state.set('password', '');
state.set('verifying', false);

const getSelector = user => {
  if (typeof user === 'string') {
    if (user.indexOf('@') === -1) {
      return {username: user};
    }
    return {email: user};
  }
  return user;
};

const getAuthCode = (user, password, cb) => {
  const selector = getSelector(user);

  const callback = error => {
    if (error) {
      return typeof cb === 'function' && cb(error);
    }

    state.set('verifying', true);
    state.set('user', user);
    state.set('password', password);

    return typeof cb === 'function' && cb();
  };

  Meteor.call(
    'twoFactor.getAuthenticationCode',
    selector,
    password,
    callback
  );
};

const getNewAuthCode = cb => {
  const selector = getSelector(state.get('user'));
  const password = state.get('password');

  const callback = error => {
    if (error) {
      return typeof cb === 'function' && cb(error);
    }

    return typeof cb === 'function' && cb();
  };

  Meteor.call(
    'twoFactor.getAuthenticationCode',
    selector,
    password,
    callback
  );
};

const verifyAndLogin = (code, cb) => {
  const selector = getSelector(state.get('user'));

  Accounts.callLoginMethod({
    methodName: 'twoFactor.verifyCodeAndLogin',
    methodArguments: [{
      user: selector,
      password: state.get('password'),
      code
    }],
    userCallback: error => {
      if (error) {
        return typeof cb === 'function' && cb(error);
      }

      state.set('verifying', false);
      state.set('user', '');
      state.set('password', '');

      return typeof cb === 'function' && cb();
    }
  });
};

const isVerifying = () => state.get('verifying');

twoFactor.getAuthCode = getAuthCode;
twoFactor.getNewAuthCode = getNewAuthCode;
twoFactor.verifyAndLogin = verifyAndLogin;
twoFactor.isVerifying = isVerifying;
