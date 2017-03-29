Accounts.onCreateUser(function (options, user) {
  user.displayName = options.profile.name || options.username;
  if (options.profile) {
    user.profile = options.profile;
  }
  return user;
});
