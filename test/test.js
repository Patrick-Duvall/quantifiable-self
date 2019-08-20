process.env.NODE_ENV = 'test';
var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();
// Import the dependencies for testing
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var Food = require('../models').Food;
// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Foods", () => {
  afterEach(() => {
    Food.destroy({
      where: {},
      truncate: true
    })
  })
    describe("GET /api/v1/foods", () => {
        // Test to get all students record
        it("should get all foods record", (done) => {
          Food.bulkCreate([
            {
              name: 'pizza',
              calories: 600
            },
            {
              name: 'salad',
              calories: 100
            }
          ]
        )
        .then(() => {
          chai.request(app)
          .get('/api/v1/foods')
          .end((err, res) => {
            res.should.have.status(200);
            res.body[0].should.be.a('object');
            res.body[0].name.should.equal('pizza')
            res.body[0].calories.should.equal(600)
            res.body.should.have.lengthOf(2);
            done();
          });
        })
         });
        // Test to get single student record
        xit("should get a single food record", (done) => {
             const id = 1;
             chai.request(app)
                 .get(`/${id}`)
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.be.a('object');
                     done();
                  });
         });

        // Test to get single student record
        xit("should not get a single student record", (done) => {
             const id = 5;
             chai.request(app)
                 .get(`/${id}`)
                 .end((err, res) => {
                     res.should.have.status(404);
                     done();
                  });
         });
    });
});