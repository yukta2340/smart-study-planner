const express = require('express');
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { validateSubject } = require('../middleware/validationMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, validateSubject, createSubject);

router.route('/:id')
  .put(protect, validateSubject, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;
