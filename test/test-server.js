const chai = require('chai');
const chaiHttp = require('chai-http');
const {TEST_DATABASE_URL} = require('../config');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

describe('API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

after(function() {
  return closeServer();
});

  it('should 404 on GET requests', function() {
    return chai.request(app)
      .get('/api/fooooo')
      .then(function(res) {
        res.should.have.status(404);
        res.should.be.json;
      });
  });
});