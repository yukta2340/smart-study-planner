const { registerUser, loginUser } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');
const router = express.Router();

router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

module.exports = router;
