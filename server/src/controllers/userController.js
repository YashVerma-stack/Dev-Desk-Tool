import {
  getAllUsers,
  findUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUserPassword,
  updateUserPassword,
  restoreUser,
} from "../models/userModel.js";
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

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { name, email, role } = req.body;

    const result = await updateUser(
      userId,
      name ?? null,
      email ?? null,
      role ?? null
    );

    // User does not exist
    if (result.status === "not_found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent role change for assigned members
    if (result.status === "assigned_member") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot change this member's role because they are assigned to projects. Remove their project assignments first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.user,
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

    const deleteResult = await deleteUser(userId);

    // Prevent deletion if this user is the last active member
    if (deleteResult.status === "last_member") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this user because they are the last active member of a project",
      });
    }

    // Handle user not found or already deleted
    if (deleteResult.status !== "deleted" || !deleteResult.user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: deleteResult.user,
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

export const restoreUserController = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Validate user ID
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Restore deleted user
    const user = await restoreUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or account is already active",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User account restored successfully",
      user,
    });
  } catch (error) {
    console.error("Restore user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to restore user account",
    });
  }
};
