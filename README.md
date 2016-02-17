# Meteor Two Factor

Simple two factor authentication for accounts-password.

## Installation

```sh
$ meteor add dburles:two-factor
```

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

The following method is reactive and represents the state of authentication. Use it to display the UI to enter the authentication code.

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

Assign a function to `twoFactor.sendCode` that sends out the code. The example below sends the user an email.

```js
twoFactor.sendCode = (user, code) => {
  // Send code via email
  Email.send({
    to: user.email(), // Method attached using dburles:collection-helpers
    from: 'noreply@example.com',
    subject: 'Your authentication code',
    text: `${code} is your authentication code.`
  });
};
```

**Optional functions:**

```js
// Optional
// Conditionally allow regular or two-factor sign in
twoFactor.validateLoginAttempt = options => {
  return !! options.user.twoFactorEnabled;
};
```

```js
// Optional
twoFactor.generateCode = () => {
  // return a random string
};
```

## API

The following methods are attached to the `twoFactor` namespace. This may change somewhat for Meteor 1.3.

## API (Client)

#### getAuthCode(user, password, [callback])

Generates an authentication code. Once generated, a `twoFactorCode` field is added to the current user document.

**user** Accepts either a username or email as the `user` argument.

**password** The user's password.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

#### verifyAndLogin(code, [callback])

Verifies authentication code and logs in user.

**code** The authentication code.

**callback** Optional callback. Called with no arguments on success, or with a single Error argument on failure.

#### isVerifying()

Reactive function that indicates the current state between having generated an authentication code and awaiting verification.

## API (Server)

#### sendCode(user, code)

This function is called after `getAuthCode` is successful.

**user** The current user document.

**code** The generated authentication code.

#### validateLoginAttempt(options) (Optional)

If defined, this function is called within an `Accounts.validateLoginAttempt` callback.
Use this to allow regular login under certain conditions.

#### generateCode (Optional)

If defined, this function is called to generate the random code instead of the default.

### License

MIT
