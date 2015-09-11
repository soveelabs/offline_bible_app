var models = require('./models');

models.User.create({
  email: 'binu.alexander@icloud.com',
  hashed_password: '$2a$10$JMVRZeyqHDDlETjR14sOsO17yk/7iDUBXJzgKVuyt8ps25tIXYPWG',
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
