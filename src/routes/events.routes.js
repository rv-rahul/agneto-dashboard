'use strict';

const { Router }  = require('express');
const ctrl        = require('../controllers/events.controller');
const { validateEvent, validateEventId } = require('../validators/events.validator');

const router = Router();

router.get('/',     ctrl.list);                              // GET    /api/events?type=holiday&upcoming=true
router.get('/:id',  validateEventId, ctrl.getOne);           // GET    /api/events/:id
router.post('/',    validateEvent,   ctrl.create);           // POST   /api/events
router.put('/:id',  validateEventId, validateEvent, ctrl.update); // PUT    /api/events/:id
router.delete('/:id', validateEventId, ctrl.remove);         // DELETE /api/events/:id

module.exports = router;
