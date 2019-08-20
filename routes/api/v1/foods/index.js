var router = require('express').Router();
var foodsController = require('../../../../controllers/api/v1/foods_controller')

router.get('/', foodsController.index)

router.get('/:id', foodsController.show)


module.exports = router;
