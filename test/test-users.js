const chai = require('chai');
const chaiHttp = require('chai-http');
const {TEST_DATABASE_URL} = require('../config');

const {User} = require('../users')

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const expect = chai.expect;


const testUser = {
    firstName:"test",
    lastName:"user",
    username:"testUser2",
    password:"password123",
    companyID:"testCompany",
}

describe('Users API', function() {
    before(function() {
      return runServer(TEST_DATABASE_URL);
    });
  
  after(function() {
      User.deleteMany({})
      .then(res=>closeServer());
    ;
  });
  it('Should create a new user', function () {
    return chai
    .request(app)
    .post('/api/user')
    .send({
        username:testUser.username,
        password:testUser.password,
        firstName:testUser.firstName,
        lastName:testUser.lastName,
        companyID:testUser.companyID
    })
    .then(res => {
        //console.log(res);
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(
        'username',
        'firstName',
        'lastName',
        'companyID',
        );
        expect(res.body.username).to.equal(testUser.username);
        expect(res.body.firstName).to.equal(testUser.firstName);
        expect(res.body.lastName).to.equal(testUser.lastName);
        return User.findOne({
        username:testUser.username
        });
    })
    .then(user => {
        expect(user).to.not.be.null;
        expect(user.firstName).to.equal(testUser.firstName);
        expect(user.lastName).to.equal(testUser.lastName);
        return user.validatePassword(testUser.password);
    })
    .then(passwordIsCorrect => {
        expect(passwordIsCorrect).to.be.true;
    });
    });

  describe('Get', function(){
    it('Should return a user information', function(){
        return chai
        .request(app)
        .post('/api/auth/login')
        .send({ 
            username:testUser.username, 
            password:testUser.password
        })
        .then(res=>{

            //console.log('auth'+res.body.authToken);
            return res.body.authToken;
        })
        .then(authToken=>{
            return chai
            .request(app)
            .get('/api/user')
            .set('Authorization', `bearer ${authToken}`)
            .then(res => {
                //console.log(res.body);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.keys(
                'username',
                'firstName',
                'lastName',
                'companyID',
                );
                expect(res.body.username).to.equal(testUser.username);
                expect(res.body.firstName).to.equal(testUser.firstName);
                expect(res.body.lastName).to.equal(testUser.lastName);
            });
        })
    });
    });

    describe('Delete', function(){
        it('Should delete a user of a specific username', function(){
            return chai
            .request(app)
            .post('/api/auth/login')
            .send({ username:testUser.username, password:testUser.password})
            .then(res=>{
                //console.log('auth'+res.body.authToken);
                return res.body.authToken;
            })
            .then(authToken=>{
                return chai
                .request(app)
                .delete('/api/user')
                .send({username:testUser.username})
                .set('Authorization', `bearer ${authToken}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    return User.count();
                })
                .then (count=>{
                    expect(count).to.equal(0);
                })
            })
        });
    })
});