const express = require('express');
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { validateSubject } = require('../middleware/validationMiddleware');
const router = express.Router();

router.route('/')
  .get(getSubjects)
  .post(validateSubject, createSubject);

router.route('/:id')
  .put(validateSubject, updateSubject)
  .delete(deleteSubject);

module.exports = router;
