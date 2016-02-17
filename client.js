/* globals twoFactor */

const state = new ReactiveDict('twoFactor');

state.set('user', '');
state.set('password', '');
state.set('verifying', false);

const getAuthCode = (user, password, errorCb) => {
  let selector = user;

  if (selector.indexOf('@') === -1) {
    selector = {username: selector};
  } else {
    selector = {email: selector};
  }

  const callback = error => {
    if (error) {
      return errorCb(error);
    }

    state.set('verifying', true);
    state.set('user', user);
    state.set('password', password);
  };

  Meteor.call(
    'twoFactor.getAuthenticationCode',
    selector,
    password,
    callback
  );
};

const verifyAndLogin = (code, errorCb) => {
  let selector = state.get('user');

  if (selector.indexOf('@') === -1) {
    selector = {username: selector};
  } else {
    selector = {email: selector};
  }

  Accounts.callLoginMethod({
    methodName: 'twoFactor.verifyCodeAndLogin',
    methodArguments: [{
      user: selector,
      password: state.get('password'),
      code
    }],
    userCallback: error => {
      if (error) {
        return errorCb(error);
      }

      state.set('verifying', false);
      state.set('user', '');
      state.set('password', '');
    }
  });
};

const isVerifying = () => state.get('verifying');

twoFactor.getAuthCode = getAuthCode;
twoFactor.verifyAndLogin = verifyAndLogin;
twoFactor.isVerifying = isVerifying;
