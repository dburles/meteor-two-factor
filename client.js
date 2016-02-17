/* globals twoFactor */

const state = new ReactiveDict('twoFactor');

state.set('user', '');
state.set('password', '');
state.set('verifying', false);

const getSelector = user => {
  if (user.indexOf('@') === -1) {
    return {username: user};
  }
  return {email: user};
};

const getAuthCode = (user, password, errorCb) => {
  const selector = getSelector(user);

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
