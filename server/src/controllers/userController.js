import { getAllUsers, findUserById, updateUser, deleteUser, getUserProfile, updateUserProfile, getUserPassword, updateUserPassword} from "../models/userModel.js";
import bcrypt from "bcrypt";

// GET all users (Admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// GET user by ID (Admin only)
export const getUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

// UPDATE user (Admin only)
export const editUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const { name, email, role } = req.body;

        const existingUser = await findUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const updatedUser = await updateUser(
            userId,
            name ?? null,
            email ?? null,
            role ?? null
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update user error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update user",
        });
    }
};

// DELETE user (Admin only)
export const removeUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Prevent admin from deleting their own account
        if (userId === Number(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account",
            });
        }

        const existingUser = await findUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check whether user is already deleted
        if (existingUser.is_deleted) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const deletedUser = await deleteUser(userId);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user: deletedUser,
        });
    } catch (error) {
        console.error("Delete user error:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                success: false,
                message:
                    "This user cannot be deleted because they are referenced by existing records",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
        });
    }
};

// GET logged-in user's profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// UPDATE logged-in user's profile
export const editMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const updatedUser = await updateUserProfile(
      userId,
      name ?? null,
      email ?? null
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 1. Get existing password hash
    const user = await getUserPassword(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update password in database
    const updatedUser = await updateUserPassword(
      userId,
      hashedPassword
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Unable to update password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};