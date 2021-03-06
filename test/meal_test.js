var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var Food = require('../models').Food;
var Meal = require('../models').Meal;
var MealFoods = require('../models').MealFoods;
chai.use(chaiHttp);

describe("Meals", () => {

  before(async () => {
    await Food.bulkCreate([
      {
        id: 9000,
        name: 'pizza',
        calories: 600
      },
      {
        id: 9010,
        name: 'salad',
        calories: 100
      },
      {
        id: 9012,
        name: 'taco',
        calories: 800
      }
    ])
    await Meal.bulkCreate([
      {
        id: 8000,
        name: 'Breakfast'
      },
      {
        id: 8010,
        name: 'Lunch'
      },
      {
        id: 8011,
        name: 'Dinner'
      }
    ])
    await MealFoods.bulkCreate([
      {
        foodId: 9000,
        mealId: 8000
      },
      {
        foodId: 9010,
        mealId: 8010
      },
      {
        foodId: 9000,
        mealId: 8010
      }
    ])
  })

  after(async () => {
    await MealFoods.destroy({
      where: {},
      truncate: true
    })

    await Food.destroy({
      where: {},
      truncate: true
    })

    await Meal.destroy({
      where: {},
      truncate: true
    })
  })

  describe("GET /api/v1/meals", () => {
    it("should get all meals records", (done) => {
      chai.request(app)
      .get('/api/v1/meals')
      .end((err, res) => {
        res.should.have.status(200);
        res.body[0].should.be.a('object');
        res.body[0].name.should.equal('Breakfast');
        res.body[0].foods.should.be.a('array');
        res.body[0].foods[0].name.should.equal('pizza')
        res.body[0].foods.should.have.lengthOf(1);
        res.body[1].foods.should.have.lengthOf(2);
        res.body[0].should.not.have.property('createdAt')
        res.body[0].should.not.have.property('updatedAt')
        res.body[0].foods[0].should.not.have.property('createdAt')
        res.body[0].foods[0].should.not.have.property('updatedAt')
        res.body[0].foods[0].should.not.have.property('MealFoods')
        res.body.should.have.lengthOf(3);
        done();
      });
    });
    it("should get all meals records limit 2", (done) => {
      chai.request(app)
      .get('/api/v1/meals?limit=2')
      .end((err, res) => {
        res.should.have.status(200);
        res.body[0].should.be.a('object');
        res.body.should.have.lengthOf(2);
        done();
      });
    });
    it("should get all meals records limit 5", (done) => {
      chai.request(app)
      .get('/api/v1/meals?limit=5')
      .end((err, res) => {
        res.should.have.status(200);
        res.body[0].should.be.a('object');
        res.body.should.have.lengthOf(3);
        done();
      });
    });
  });
  describe("GET /api/v1/meals/:id/foods", () => {
    it("should get one meal record", (done) => {
      chai.request(app)
      .get('/api/v1/meals/8010/foods')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.id.should.equal(8010);
        res.body.name.should.equal("Lunch");
        res.body.foods.should.be.a("array");
        res.body.foods.should.have.lengthOf(2);
        res.body.foods[0].name.should.equal("pizza");
        res.body.should.not.have.property('createdAt')
        res.body.should.not.have.property('updatedAt')
        res.body.foods[0].should.not.have.property('createdAt')
        res.body.foods[0].should.not.have.property('updatedAt')
        res.body.foods[0].should.not.have.property('MealFoods')
        done();
      });
    });
    it("should not get one meal record", (done) => {
      chai.request(app)
      .get('/api/v1/meals/10000010/foods')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });
  });

  describe("POST /api/v1/meals/:id/foods/:food_id", () => {
    it("should add a food to a meal", (done) => {
      chai.request(app)
      .post('/api/v1/meals/8010/foods/9012')
      .end((err, res) => {
        res.should.have.status(201);
        res.body.message.should.equal('Successfully added taco to Lunch')
        Meal.findOne({
          where: {
            id: 8010
          },
          include: [
            {
              model: Food,
              as: 'foods'
            }
          ]
        })
        .then(meal => {
          meal.foods.length.should.equal(3)
        })
        Food.findOne({
          where: {
            id: 9012
          },
          include: [
            {
              model: Meal,
              as: 'meals'
            }
          ]
        })
        .then(food => {
          food.meals.length.should.equal(1)
        })
        done();
      });
    });
    it("should return 404 if mealId does not exist", (done) => {
      chai.request(app)
      .post('/api/v1/meals/8010/foods/100000010')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });
    it("should return 404 if foodId does not exist", (done) => {
      chai.request(app)
      .post('/api/v1/meals/100000010/foods/9012')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });
  });
  describe("Delete /api/v1/meals/:id/foods/:food_id", () => {
    it("should delete a food from a meal", (done) => {
      chai.request(app)
      .delete('/api/v1/meals/8010/foods/9012')
      .end((err, res) => {
        res.should.have.status(204);
        Meal.findOne({
          where: {
            id: 8010
          },
          include: [
            {
              model: Food,
              as: 'foods'
            }
          ]
        })
        .then(meal => {
          meal.foods.length.should.equal(2)
        })
        Food.findOne({
          where: {
            id: 9012
          },
          include: [
            {
              model: Meal,
              as: 'meals'
            }
          ]
        })
        .then(food => {
          food.meals.length.should.equal(0)
        })
        done();
      });
    });
    it("should return 404 if mealId does not exist", (done) => {
      chai.request(app)
      .delete('/api/v1/meals/8010/foods/100000010')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });
    it("should return 404 if foodId does not exist", (done) => {
      chai.request(app)
      .delete('/api/v1/meals/100000010/foods/9012')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    });
  });
});
