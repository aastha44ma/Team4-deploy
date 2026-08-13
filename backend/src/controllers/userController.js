const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        incomeBracket: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(user);

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE LOGGED-IN USER PROFILE
// =====================================================

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      name,
      country,
      incomeBracket
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name,
        country,
        incomeBracket
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        incomeBracket: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getProfile,
  updateProfile,
  changePassword
};