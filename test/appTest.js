const app = require('../app');
const mongoose = require('mongoose');
require('dotenv').config();
const { assert, expect } = require('chai');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Init mongoServer so we can use it everywhere
let mongoServer;

// Test credentials
const username = 'test';
const password = 'pword8chars';
const password1 = 'pword8chars';
const email = 'test@gmail.com';
var jwt_token, user_id; // for later testing with login flow

describe('GET /', () => {
    before(done => {
        mongoServer = new MongoMemoryServer();
        mongoServer
            .getConnectionString()
            .then(async conn_uri => {
                await mongoose.connect(conn_uri, {useNewUrlParser: true});
                console.log('Connected');
                done();
            })
    })

    after(done => {
        (async () => {
            await mongoose.disconnect()
            await mongoServer.stop()
            done();
        })()
    })

    // ================================================================
    // START /new-user ROUTE

    // GET /new-user return 404
    it('GET /new-user should return 404', done => {
        request(app)
            .get('/new-user')
            .then(res => {
                assert.equal(res.statusCode, 404);
                done()
            })
            .catch(err => done(err));
    })

    // POST /new-user with errors
    it('POST /new-user not all fields filled out', done => {
        request(app)
            .post('/new-user')
            .then(({ body }) => {
                // Errors get returned as an array
                assert.isArray(body);
                done();
            })
            .catch(err => done(err))
    })

    // POST /new-user
    it('POST /new-user with fields filled out correctly', done => {
        request(app)
            .post('/new-user')
            .send({
                username,
                password,
                password1,
                email
            })
            .then(({ body }) => {
                expect(body).to.have.property('username');
                expect(body).to.have.property('email');
                expect(body).to.have.property('id');
                assert.equal(body.username, username);
                assert.equal(body.email, email);
                done();
            })
            .catch(err => done(err))
    })

    // END /new-user ROUTE
    // ================================================================

    // ================================================================
    // START /login ROUTE

    // We created a user in our test database, let's try the login flow
    it('POST /login with incorrect credentials', done => {
        request(app)
            .post('/login')
            .then(({ body }) => {
                expect(body).to.have.property('msg');
                done();
            })
            .catch(err => done(err));
    })


    // Let's try it now and attach the valid credentials
    it('POST /login with correct credentials', done => {
        request(app)
            .post('/login')
            .send({ username, password })
            .then(({ body }) => {
                expect(body).to.have.property('token');
                expect(body).to.have.property('user_id');
                jwt_token = body.token;
                user_id = body.user_id;
                done();
            })
            .catch(err => done(err))
    })


    // Try with incorrect password
    it('POST /login incorrect password', done => {
        request(app)
            .post('/login')
            .send({ username, password: 'incorrectpword'})
            .then(({ body }) => {
                expect(body).to.have.property('msg');
                assert.equal(body.msg, 'Password is incorrect');
                done();
            })
            .catch(err => done(err))
    })

    // END /login ROUTE
    // ================================================================

    // ================================================================
    // START /load-user ROUTE

    // GET without params (Fail)
    it('GET /load-user no params (should fail)', done => {
        request(app)
            .get('/load-user')
            .then(({ body }) => {
                assert.isObject(body, 'Response is in json format');
                expect(body).to.have.property('msg');
                assert.equal(body.msg, 'No authentication token present in request.');
                done();
            })
            .catch(err => {
                done(err);
            })
    })

    // GET with invalid credentials (fail)
    it('GET /load-user with incorrect x-auth-token header', done => {
        request(app)
            .get('/load-user')
            .set('x-auth-token', 'invalid token')
            .then(({ body }) => {
                assert.isObject(body, 'Response is JSON');
                expect(body).to.have.property('msg');
                assert.equal(body.msg, 'Token is invalid');
                done();
            })
            .catch(err => done(err));
    })

    // POST to /load-user should return 404 (fail)
    it('POST /load-user should return 404', done => {
        request(app)
            .post('/load-user')
            .then(res => {
                assert.equal(res.statusCode, 404);
                done();
            })
            .catch(err => done(err))
    })

    // GET /load-user with valid credentials
    it('GET /load-user with valid credentials', done => {
        request(app)
            .get('/load-user')
            .set({ 'x-auth-token': jwt_token })
            .then(({ body }) => {
                expect(body).to.have.property('username');
                expect(body).to.have.property('email');
                expect(body).to.have.property('_id');
                assert.equal(body.username, username);
                assert.equal(body.email, email);
                assert.equal(body._id, user_id);
                done();
            })
            .catch(err => done(err))
    })

    // END /load-user ROUTE
    // ================================================================

    // We can now load the user, let's try some CRUD operations

    // ================================================================
    // START /delete-account ROUTE

    // GET /delete-account invalid credentials
    it('GET /delete-account with invalid credentials: should fail', done => {
        request(app)
            .get('/delete-account')
            .then(({ body }) => {
                expect(body).to.have.property('msg');
                assert.equal(body.msg, 'No authentication token present in request.');
                done();
            })
            .catch(err => done(err))
    })

    // GET /delete-account valid credentaials
    it('GET /delete-account with valid credentials: should successfully delete account', done => {
        request(app)
            .get('/delete-account')
            .set({ 'x-auth-token': jwt_token })
            .then(({ body }) => {
                expect(body).to.have.property('msg');
                assert.equal(body.msg, 'Success!');
                done();
            })
            .catch(err => done(err))
    })

})
