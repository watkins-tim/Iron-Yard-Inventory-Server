const chai = require('chai');
const chaiHttp = require('chai-http');
const {LOCAL_TEST_DATABASE_URL} = require('../config');

const {User} = require('../users');
const {Item} = require('../items/model');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const expect = chai.expect;

const testUser = {
    firstName:"test",
    lastName:"user",
    username:"testUser",
    password:"password123",
    companyID:"testCompany",
};

const testItem = {
    location: "Asheville",
    area: "Bay 6",
    quantity: 10,
    shape: "W",
    size: "14x24",
    feet: 25,
    inches: 6,
    fraction: 0,
    grade: "A992",
    reserve: "TestJob",
    po:"1234",
    remarks: "Holes"
}

const keys = Object.keys(testItem);

describe('Items API', function(){
    before(function() {
        runServer(LOCAL_TEST_DATABASE_URL)
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
        .then(res=>{
            //console.log(res);
        })
    });

    
    after(function() {
        return User.deleteOne({username:testUser.username})
        .then(res=>{
           //console.log(res);
            return Item.deleteMany({})
        })
        .then(res=>{
            //console.log(res);
            closeServer();
        })
        .catch(err=>console.log(err));
    });

    let id;
    describe('The Post Endpoint', function(){
        it('should return the newly created inventory item', function(){
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
                .post('/api/item')
                .send(testItem)
                .set('Authorization', `bearer ${authToken}`)
                .then (res=>{
                    //console.log(res.body);
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(keys);
                    return res.body
                })
                .then(body=>{
                    expect(body.size).to.equal(testItem.size)
                })
            })
            //.catch(err=>console.log(err))
        });
    });

    describe('the Get endpoint', function(){

        it('should return all of the inventory items for a company', function(){
            this.timeout(1000);
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
                .get('/api/item?page=0')
                .set('Authorization', `bearer ${authToken}`)
                .then(res => {
                    //console.log(res);
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    //console.log(res.body.length);
                    expect(res.body.length).to.equal(1);
                    id = res.body[0].id;
                    //console.log(id);
                })
            })
            //.catch(err=>console.log(err));
        });
    });

    describe('The Put Endpoint', function(){
        it('should return the changed inventory item', function(){
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
                .put(`/api/item/${id}`)
                .send({remarks:"Changed"})
                .set('Authorization', `bearer ${authToken}`)
                .then (res=>{
                    //console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(keys);
                    return res.body
                })
                .then(body=>{
                    expect(body.remarks).to.equal("Changed")
                })
            })
            //.catch(err=>console.log(err))
        });
    });

    describe('Delete', function(){
        this.timeout(1000);
        it('Should delete a post of a specific id', function(){
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
                .delete(`/api/item/${id}`)
                .set('Authorization', `bearer ${authToken}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    return Item.count();
                })
                .then (count=>{
                    expect(count).to.equal(0);
                })
                //.catch(err=>console.log(err))
            })
        });
    })
});
