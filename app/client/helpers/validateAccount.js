var signUpPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.signUpPanel'),
    logInPanel = DEPNES.namespace('client.templates.layouts.masterLayout.components.logInPanel');

///////////////////////////////////////////
signUpPanel.validate = function (fields) {
  var errors = {},
      emailRE = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
      nameRE = /^[a-z]([-']?[a-z]+)*( [a-z]([-']?[a-z]+)*)+$/;

  if (!fields.email) {
    errors.email = 'An email address is required';
  } else if (!emailRE.test(fields.email)) {
    errors.email = 'Please provide a valid email.';
  }

  // if full name is provided
  if (fields.profile.name.length > 0) {
    // if lower cased profile name doesn't pass regex test
    if (!nameRE.test(fields.profile.name.toLowerCase())) {
      errors.name = 'Please use your full name';
    }
  }

  if (!fields.username) {
    errors.username = "A username is required";
  }

  if (!fields.password) {
    errors.password = 'Please provide a password';
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!fields.terms) {
    errors.terms = 'You must agree to the terms of use below';
  }

  return errors;
};


///////////////////////////////////
logInPanel.validate = function (fields) {
  var errors = {};

  if (!fields.user) {
    errors.user = 'Not a valid email or username.';
  }

  if (!fields.password || fields.password.length < 6) {
    errors.password = 'Invalid password.';
  }

  return errors;
};
