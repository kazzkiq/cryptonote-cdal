module.exports = function(app) {
  var controller = app.controllers.transaction;

  app.route('/v1/transactions')
    .get(controller.getAll);

  app.route('/v1/transactions/:transactionHash')
    .get(controller.getByTransactionHash);

  app.route('/v1/:ownerId/transactions')
    .get(controller.getAllByOwnerId)
    .post(controller.save);

  app.route('/v1/:ownerId/transactions/:transactionHash')
    .get(controller.getByTransactionHash);
};