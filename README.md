# Meteor Two Factor

Simple two factor authentication for accounts-password

## Installation

```sh
$ meteor add dburles:two-factor
```

## Usage

TODO

## API

The following methods are attached to the `twoFactor` namespace.

## API (Client)

#### getAuthCode(user, password, [callback])

Generates an authentication code.

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
