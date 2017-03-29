if (!Meteor.users.findOne({username: 'andruti'})) {
  Accounts.createUser({
    username: 'andruti',
    email: 'carbindustries@gmail.com',
    password: 'andruti',
    profile: {
      name: 'Andres Carbo'
    }
  });
}
