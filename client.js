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

const callbackHandler = (cb, handlerCb) => {
  return error => {
    if (error) {
      return typeof cb === 'function' && cb(error);
    }

    handlerCb();

    return typeof cb === 'function' && cb();
  };
};

const getAuthCode = (user, password, cb) => {
  const selector = getSelector(user);

  const callback = callbackHandler(cb, () => {
    state.set('verifying', true);
    state.set('user', user);
    state.set('password', password);
  });

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
  const callback = callbackHandler(cb);

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
    userCallback: callbackHandler(cb, () => {
      state.set('verifying', false);
      state.set('user', '');
      state.set('password', '');
    })
  });
};

const isVerifying = () => state.get('verifying');

twoFactor.getAuthCode = getAuthCode;
twoFactor.getNewAuthCode = getNewAuthCode;
twoFactor.verifyAndLogin = verifyAndLogin;
twoFactor.isVerifying = isVerifying;
