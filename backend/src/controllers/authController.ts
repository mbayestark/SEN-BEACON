import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error during logout'
        });
        return;
      }

      res.clearCookie('connect.sid');
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session || !req.session.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const user = await User.findById(req.session.userId).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'government'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
