var models = require('./models');

models.User.create({
  email: 'binu.alexander@icloud.com',
  hashed_password: '$2a$10$z9Xvrk/1SIAnAnrXRSSLJ.rCWqWqhm2sKUoXYUmcOuyCGmN.bIMc6 ',
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
