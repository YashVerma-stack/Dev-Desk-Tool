import express from "express";
import { getUsers, getUser, editUser, removeUser, getMyProfile, editMyProfile, changeMyPassword} from "../controllers/userController.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { updateUserSchema, updateProfileSchema, changePasswordSchema } from "../validators/userValidator.js";

const router = express.Router();

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};

// ===================================
// MEMBER PROFILE ROUTES
// ===================================

// GET logged-in user's profile
router.get("/profile", getMyProfile);

// UPDATE logged-in user's profile
router.patch(
  "/profile",
  validate(updateProfileSchema),
  editMyProfile
);

// CHANGE logged-in user's password
router.patch(
  "/change-password",
  validate(changePasswordSchema),
  changeMyPassword
);

// ===================================
// ADMIN-ONLY USER MANAGEMENT ROUTES
// ===================================

router.use(authorizeRoles("admin"));

// GET all users
router.get("/", getUsers);

// GET user by ID
router.get("/:id", getUser);

// UPDATE user
router.patch("/:id", validate(updateUserSchema), editUser);

// DELETE user
router.delete("/:id", removeUser);

export default router;
