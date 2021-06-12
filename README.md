# Meteor Two Factor

Simple two factor authentication for accounts-password.

## Table of Contents

- [Installation](https://github.com/dburles/meteor-two-factor#installation)
- [Prerequisites](https://github.com/dburles/meteor-two-factor#prerequisites)
- [Example Application](https://github.com/dburles/meteor-two-factor#example-application)
- [Usage](https://github.com/dburles/meteor-two-factor#example-application)
  - [Client](https://github.com/dburles/meteor-two-factor#usage-client)
  - [Server](https://github.com/dburles/meteor-two-factor#usage-server)
- [API](https://github.com/dburles/meteor-two-factor#api)
  - [Client](https://github.com/dburles/meteor-two-factor#api-client)
    - [getAuthCode](https://github.com/dburles/meteor-two-factor#getauthcode)
    - [getNewAuthCode](https://github.com/dburles/meteor-two-factor#getnewauthcode)
    - [verifyAndLogin](https://github.com/dburles/meteor-two-factor#verifyandlogin)
    - [isVerifying](https://github.com/dburles/meteor-two-factor#isverifying)
    - [abort](https://github.com/dburles/meteor-two-factor#abort)
  - [Server](https://github.com/dburles/meteor-two-factor#api-server)
    - [sendCode](https://github.com/dburles/meteor-two-factor#sendcode)
    - [options](https://github.com/dburles/meteor-two-factor#options)
    - [validateLoginAttempt](https://github.com/dburles/meteor-two-factor#validateloginattempt-optional)
    - [generateCode](https://github.com/dburles/meteor-two-factor#generatecode-optional)
- [License](https://github.com/dburles/meteor-two-factor#license)

## Installation

```sh
$ meteor add dburles:two-factor
```

## Prerequisites

Make sure your project is using Meteor's `accounts-password` package, if not add it: `meteor add accounts-password`

## Example Application

[Simple example application](https://github.com/dburles/two-factor-example)

## Usage

Client and server usage examples.

## Usage (Client)

Typically you would call this method via your application login form event handler:

```js
twoFactor.getAuthCode(user, password, error => {
  if (error) {
    // Handle the error
  }
  // Success!
});
```

After calling `getAuthCode` if you wish, you can request a new authentication code:

```js
twoFactor.getNewAuthCode(error => {
  if (error) {
    // Handle the error
  }
  // Success!
});
```

The following method is reactive and represents the state of authentication. Use it to display the interface to enter the authentication code:

```js
Tracker.autorun(function() {
  if (twoFactor.isVerifying()) {
    console.log('Ready to enter authentication code!');
  }
});
```

Capture the authentication code and pass it to the following method to validate the code and log the user in:

```js
twoFactor.verifyAndLogin(code, error => {
  if (error) {
    // Handle the error
  }
  // Success!
});
```

## Usage (Server)

Assign a function to `twoFactor.sendCode` that sends out the code. The example below sends the user an email:

```js
twoFactor.sendCode = (user, code) => {
  // Don't hold up the client
  Meteor.defer(() => {
    // Send code via email
    Email.send({
      to: user.email(), // Method attached using dburles:collection-helpers
      from: 'noreply@example.com',
      subject: 'Your authentication code',
      text: `${code} is your authentication code.`
    });
  });
};
```

**Optional functions:**

```js
// Optional
// Conditionally allow regular or two-factor sign in
twoFactor.validateLoginAttempt = options => {
  // If two factor auth isn't enabled for this user, allow regular sign in.
  return !options.user.twoFactorEnabled;
};
```

```js
// Optional
twoFactor.generateCode = () => {
  // return a random string
};
```

**Security note:**

Use [DDPRateLimiter](https://docs.meteor.com/api/methods.html#ddpratelimiter) to prevent verification code cracking

```js
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

const numberOfAttempts = 5;
const timeInterval = 60;

DDPRateLimiter.addRule(
  {
    type: 'method',
    userId: null,
    clientAddress: null,
    name(name) {
      const methods = [
        'twoFactor.verifyCodeAndLogin',
        'twoFactor.getAuthenticationCode'
      ];
      return methods.includes(name);
    },
    connectionId() {
      return true;
    }
  },
  numberOfAttempts,
  timeInterval * 1000
);
```

## API

The following functions are attached to the `twoFactor` namespace. This may change somewhat for Meteor 1.3.

## API (Client)

### getAuthCode

```
getAuthCode(user, password, [callback])
```

Generates an authentication code. Once generated, (by default) a `twoFactorCode` field is added to the current user document. This function mirrors [Meteor.loginWithPassword](http://docs.meteor.com/#/full/meteor_loginwithpassword).

**user** Either a string interpreted as a username or an email; or an object with a single key: email, username or id. Username or email match in a case insensitive manner.

**password** The user's password.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

### getNewAuthCode

```
getNewAuthCode([callback])
```

Generates a new authentication code. Only functional while verifying.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

### verifyAndLogin

```
verifyAndLogin(code, [callback])
```

Verifies authentication code and logs in the user.

**code** The authentication code.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

### isVerifying

```
isVerifying()
```

Reactive function that indicates the current state between having generated an authentication code and awaiting verification.

### abort

```
abort([callback])
```

Call this function while verifying if you wish to allow the user to sign in again.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

## API (Server)

### sendCode

```
sendCode(user, code)
```

This function is called after `getAuthCode` is successful.

**user** The current user document.

**code** The generated authentication code.

### options

```
twoFactor.options.fieldName = 'customFieldName';
```

Specify the name of the field on the user document to write the authentication code. Defaults to `twoFactorCode`.

### validateLoginAttempt (Optional)

```
validateLoginAttempt(options)
```

If defined, this function is called within an `Accounts.validateLoginAttempt` callback.
Use this to allow regular login under certain conditions.

### generateCode (Optional)

If defined, this function is called to generate the random code instead of the default.

### License

MIT
