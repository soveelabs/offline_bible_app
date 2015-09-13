var models = require('./models');

models.User.create({
  email: 'joel@mail.com',
  hashed_password: '$2a$08$OGj1xfz9LUBQFej.m3nEuuYty8FMnV6yAOr5bf2afQoUS8aC8zmB6',
  password_reset_token: 'resetpass'
}, function() {
  models.OAuthClientsModel.create({
    clientId: 'papers3',
    clientSecret: '123',
    redirectUri: '/oauth/redirect'
  }, function() {
    process.exit();
  });
});
