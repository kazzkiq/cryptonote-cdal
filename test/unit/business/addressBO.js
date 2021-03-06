var AddressBO         = require('../../../src/business/addressBO');
var ModelParser       = require('../../../src/models/modelParser');
var DaemonHelper      = require('../../../src/helpers/daemonHelper');
var DateHelper        = require('../../../src/helpers/dateHelper');
var DAOFactory        = require('../../../src/daos/daoFactory');
var chai              = require('chai');
var sinon             = require('sinon');
var expect            = chai.expect;

describe('Business > AddressBO > ', function() {
  var addressDAO = DAOFactory.getDAO('address');
  var dateHelper = new DateHelper();
  var modelParser = new ModelParser();
  var daemonHelper = new DaemonHelper({});

  var addressBO = new AddressBO({
    addressDAO: addressDAO,
    modelParser: modelParser,
    dateHelper: dateHelper,
    daemonHelper: daemonHelper
  });

  describe('Methods > ', function() {
    it('clear', function() {
      var clearStub = sinon.stub(addressDAO, 'clear');
      clearStub
        .withArgs()
        .returns(Promise.resolve());

      return addressBO.clear()
        .then(function(){
          expect(clearStub.callCount).to.be.equal(1);
          clearStub.restore();
        });
    });

    it('getAll', function() {
      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({isEnabled: true})
        .returns(Promise.resolve([]));

      return addressBO.getAll()
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);

          getAllStub.restore();
        });
    });

    it('getFreeAddresses', function() {
      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({
          ownerId: null,
          isEnabled: true
        })
        .returns(Promise.resolve([]));

      return addressBO.getFreeAddresses()
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);

          getAllStub.restore();
        });
    });

    it('createAddressFromDaemon', function() {
      var createAddressStub = sinon.stub(daemonHelper, 'createAddress');
      createAddressStub
        .withArgs()
        .returns(Promise.resolve({
          result: {
            address: 'address'
          }
        }));

      var getSpendKeysStub = sinon.stub(daemonHelper, 'getSpendKeys');
      getSpendKeysStub
        .withArgs('address')
        .returns(Promise.resolve({
          result: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          }
        }));

      var now = new Date();
      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var saveStub = sinon.stub(addressDAO, 'save');
      saveStub
        .withArgs({
          ownerId: null,
          address: 'address',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          }
        })
        .returns({
          _id: 'ID',
          ownerId: null,
          address: 'address',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          }
        });

      return addressBO.createAddressFromDaemon(null)
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.ownerId).to.be.null;
          expect(r.address).to.be.equal('address');
          expect(r.keys.spendPublicKey).to.be.equal('spendPublicKey');
          expect(r.keys.spendSecretKey).to.be.equal('spendSecretKey');
          expect(r.createdAt).to.be.equal(now);
          expect(r.isEnabled).to.be.true;
          expect(r.balance.available).to.be.equal(0);
          expect(r.balance.locked).to.be.equal(0);
          expect(createAddressStub.callCount).to.be.equal(1);
          expect(getSpendKeysStub.callCount).to.be.equal(1);
          expect(getNowStub.callCount).to.be.equal(1);
          expect(saveStub.callCount).to.be.equal(1);

          createAddressStub.restore();
          getSpendKeysStub.restore();
          getNowStub.restore();
          saveStub.restore();
        });
    });

    it('createAddress with no free address at database', function() {
      var getAll = sinon.stub(addressDAO, 'getAll');
      getAll
        .withArgs({
          isEnabled: true,
          ownerId: null
        }, {}, '+createdAt')
        .returns(Promise.resolve([]));

      var createAddressStub = sinon.stub(daemonHelper, 'createAddress');
      createAddressStub
        .withArgs()
        .returns(Promise.resolve({
          result: {
            address: 'address'
          }
        }));

      var getSpendKeysStub = sinon.stub(daemonHelper, 'getSpendKeys');
      getSpendKeysStub
        .withArgs('address')
        .returns(Promise.resolve({
          result: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          }
        }));

      var now = new Date();
      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var saveStub = sinon.stub(addressDAO, 'save');
      saveStub
        .withArgs({
          ownerId: 'ownerId',
          address: 'address',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          }
        })
        .returns({
          _id: 'ID',
          ownerId: 'ownerId',
          address: 'address',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          updatedAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          }
        });

        var updateStub = sinon.stub(addressDAO, 'update');
        updateStub
          .withArgs({
            ownerId: 'ownerId',
            address: 'address',
            keys: {
              spendPublicKey: 'spendPublicKey',
              spendSecretKey: 'spendSecretKey'
            },
            createdAt: now,
            updatedAt: now,
            isEnabled: true,
            balance: {
              available: 0,
              locked: 0
            },
            _id: 'ID',
          })
          .returns({
            _id: 'ID',
            ownerId: 'ownerId',
            address: 'address',
            keys: {
              spendPublicKey: 'spendPublicKey',
              spendSecretKey: 'spendSecretKey'
            },
            createdAt: now,
            updatedAt: now,
            isEnabled: true,
            balance: {
              available: 0,
              locked: 0
            }
          });

      return addressBO.createAddress('ownerId')
        .then(function(r){
          expect(r.id).to.be.equal('ID');
          expect(r.ownerId).to.be.equal('ownerId');
          expect(r.address).to.be.equal('address');
          expect(r.keys.spendPublicKey).to.be.equal('spendPublicKey');
          expect(r.keys.spendSecretKey).to.be.equal('spendSecretKey');
          expect(r.createdAt).to.be.equal(now);
          expect(r.updatedAt).to.be.equal(now);
          expect(r.isEnabled).to.be.true;
          expect(r.balance.available).to.be.equal(0);
          expect(r.balance.locked).to.be.equal(0);
          expect(createAddressStub.callCount).to.be.equal(1);
          expect(getSpendKeysStub.callCount).to.be.equal(1);
          expect(getNowStub.callCount).to.be.equal(2);
          expect(saveStub.callCount).to.be.equal(1);
          expect(updateStub.callCount).to.be.equal(1);

          getAll.restore();
          createAddressStub.restore();
          getSpendKeysStub.restore();
          getNowStub.restore();
          saveStub.restore();
          updateStub.restore();
        });
    });

    it('updateWalletBalance', function() {
      var now = new Date();

      var getAddressesStub = sinon.stub(daemonHelper, 'getAddresses');
      getAddressesStub
        .withArgs()
        .returns(Promise.resolve({
          result: {
            addresses: ['ADDRESS1', 'ADDRESS2']
          }
        }));

      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({address: 'ADDRESS1', isEnabled: true})
        .returns(Promise.resolve([{
          ownerId: 'ownerId1',
          address: 'ADDRESS1',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          updatedAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          },
          id: 'ID1',
        }]));
      getAllStub
        .withArgs({address: 'ADDRESS2', isEnabled: true})
        .returns(Promise.resolve([{
          ownerId: 'ownerId2',
          address: 'ADDRESS2',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          updatedAt: now,
          isEnabled: true,
          balance: {
            available: 0,
            locked: 0
          },
          id: 'ID2',
        }]));

      var getBalanceStub = sinon.stub(daemonHelper, 'getBalance');
      getBalanceStub
        .withArgs('ADDRESS1')
        .returns(Promise.resolve({
          result: {
            availableBalance: 100,
            lockedAmount: 50
          }
        }));
      getBalanceStub
        .withArgs('ADDRESS2')
        .returns(Promise.resolve({
          result: {
            availableBalance: 10,
            lockedAmount: 5
          }
        }));

      var getNowStub = sinon.stub(dateHelper, 'getNow');
      getNowStub
        .withArgs()
        .returns(now);

      var updateStub = sinon.stub(addressDAO, 'update');
      updateStub
        .withArgs({
          ownerId: 'ownerId1',
          address: 'ADDRESS1',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          updatedAt: now,
          isEnabled: true,
          balance: {
            available: 100,
            locked: 50
          },
          _id: 'ID1',
        })
        .returns({
          ownerId: 'ownerId1',
          address: 'ADDRESS1',
          keys: {
            spendPublicKey: 'spendPublicKey',
            spendSecretKey: 'spendSecretKey'
          },
          createdAt: now,
          updatedAt: now,
          isEnabled: true,
          balance: {
            available: 100,
            locked: 50
          },
          _id: 'ID1',
        });
        updateStub
          .withArgs({
            ownerId: 'ownerId2',
            address: 'ADDRESS2',
            keys: {
              spendPublicKey: 'spendPublicKey',
              spendSecretKey: 'spendSecretKey'
            },
            createdAt: now,
            updatedAt: now,
            isEnabled: true,
            balance: {
              available: 10,
              locked: 5
            },
            _id: 'ID2',
          })
          .returns({
            ownerId: 'ownerId2',
            address: 'ADDRESS2',
            keys: {
              spendPublicKey: 'spendPublicKey',
              spendSecretKey: 'spendSecretKey'
            },
            createdAt: now,
            updatedAt: now,
            isEnabled: true,
            balance: {
              available: 10,
              locked: 5
            },
            _id: 'ID2',
          });

      return addressBO.updateWalletBalance()
        .then(function(r){
          expect(r.length).to.be.equal(2);
          expect(r[0].balance.available).to.be.equal(100);
          expect(r[1].balance.available).to.be.equal(10);
          expect(r[0].balance.locked).to.be.equal(50);
          expect(r[1].balance.locked).to.be.equal(5);

          expect(getAddressesStub.callCount).to.be.equal(1);
          expect(getAllStub.callCount).to.be.equal(2);
          expect(getBalanceStub.callCount).to.be.equal(2);
          expect(getNowStub.callCount).to.be.equal(2);
          expect(updateStub.callCount).to.be.equal(2);

          getAddressesStub.restore();
          getAllStub.restore();
          getBalanceStub.restore();
          getNowStub.restore();
          updateStub.restore();
        });
    });

    it('disable', function() {
      var deleteAddressStub = sinon.stub(daemonHelper, 'deleteAddress');
      deleteAddressStub
        .withArgs('addresse')
        .returns(Promise.resolve());

      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({address: 'address', isEnabled: true})
        .returns(Promise.resolve([{
          address: 'address',
          id: 'ID'
        }]));

      var disableStub = sinon.stub(addressDAO, 'disable');
      disableStub
        .withArgs('ID')
        .returns(Promise.resolve({
          _id: 'ID',
          address: 'address'
        }));

      return addressBO.delete(null, 'address')
        .then(function(){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(disableStub.callCount).to.be.equal(1);
          expect(deleteAddressStub.callCount).to.be.equal(1);

          getAllStub.restore();
          disableStub.restore();
          deleteAddressStub.restore();
        });
    });

    it('disable method should fail with an invalid address', function() {
      var deleteAddressStub = sinon.stub(daemonHelper, 'deleteAddress');
      var disableStub = sinon.stub(addressDAO, 'disable');

      var getAllStub = sinon.stub(addressDAO, 'getAll');
      getAllStub
        .withArgs({address: 'address', isEnabled: true})
        .returns(Promise.resolve([]));


      return addressBO.delete(null, 'address')
        .catch(function(r){
          expect(getAllStub.callCount).to.be.equal(1);
          expect(deleteAddressStub.callCount).to.be.equal(0);
          expect(disableStub.callCount).to.be.equal(0);
          expect(r.status).to.be.equal(404);
          expect(r.message).to.be.equal('The address address not found');

          getAllStub.restore();
          deleteAddressStub.restore();
          disableStub.restore();
        });
    });
  });
});
