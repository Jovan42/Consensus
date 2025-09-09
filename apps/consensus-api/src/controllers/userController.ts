import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserSettings } from '../entities/UserSettings';
import { NotificationService } from '../services/notificationService';

const userRepository = AppDataSource.getRepository(User);
const userSettingsRepository = AppDataSource.getRepository(UserSettings);

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      relations: ['settings'],
      order: { createdAt: 'DESC' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({
      where: { id },
      relations: ['settings']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, picture, role = 'user' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = userRepository.create({
      email,
      name,
      picture,
      role,
      isActive: true,
      emailVerified: false
    });

    const savedUser = await userRepository.save(user);

    // Create default settings for the user
    const defaultSettings = userSettingsRepository.create({
      userId: savedUser.id,
      theme: 'system',
      showOnlineStatus: true,
      enableNotifications: true,
      enableNotificationSound: true,
      notificationSound: 'default',
      notificationDuration: 5000,
      emailNotifications: true,
      pushNotifications: true,
      language: 'en',
      itemsPerPage: 12,
      showProfilePicture: true,
      showEmailInProfile: true,
      autoJoinClubs: false,
      showVoteProgress: true,
      showCompletionProgress: true
    });

    await userSettingsRepository.save(defaultSettings);

    // Fetch the user with settings
    const userWithSettings = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['settings']
    });

    res.status(201).json({
      success: true,
      data: userWithSettings,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, picture, role, isActive, emailVerified, timezone, locale } = req.body;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (picture !== undefined) user.picture = picture;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (emailVerified !== undefined) user.emailVerified = emailVerified;
    if (timezone !== undefined) user.timezone = timezone;
    if (locale !== undefined) user.locale = locale;

    const updatedUser = await userRepository.save(user);

    // Fetch the user with settings
    const userWithSettings = await userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['settings']
    });

    res.json({
      success: true,
      data: userWithSettings,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userEmail = req.headers['x-user-email'] as string;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (user.email === userEmail) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete user (settings will be deleted automatically due to CASCADE)
    await userRepository.remove(user);

    res.json({
      success: true,
      message: `User ${user.email} has been deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userEmail = req.headers['x-user-email'] as string;

    // Check if user is requesting their own settings or is admin
    const requestingUser = await userRepository.findOne({ where: { email: userEmail } });
    if (!requestingUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const isOwnSettings = requestingUser.id === userId;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwnSettings && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const settings = await userSettingsRepository.findOne({
      where: { userId },
      relations: ['user']
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userEmail = req.headers['x-user-email'] as string;
    const settingsData = req.body;

    // Check if user is updating their own settings or is admin
    const requestingUser = await userRepository.findOne({ where: { email: userEmail } });
    if (!requestingUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const isOwnSettings = requestingUser.id === userId;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwnSettings && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const settings = await userSettingsRepository.findOne({
      where: { userId },
      relations: ['user']
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found'
      });
    }

    // Update settings
    Object.assign(settings, settingsData);
    const updatedSettings = await userSettingsRepository.save(settings);

    res.json({
      success: true,
      data: updatedSettings,
      message: 'User settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCurrentUserSettings = async (req: Request, res: Response) => {
  try {
    const userEmail = req.headers['x-user-email'] as string;

    // Find user by email
    const user = await userRepository.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user settings
    const settings = await userSettingsRepository.findOne({
      where: { userId: user.id },
      relations: ['user']
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching current user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateCurrentUserSettings = async (req: Request, res: Response) => {
  try {
    const userEmail = req.headers['x-user-email'] as string;
    const settingsData = req.body;

    // Find user by email
    const user = await userRepository.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get existing settings
    const settings = await userSettingsRepository.findOne({
      where: { userId: user.id },
      relations: ['user']
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'User settings not found'
      });
    }

    // Update settings
    Object.assign(settings, settingsData);
    const updatedSettings = await userSettingsRepository.save(settings);

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating current user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminEmail = req.headers['x-user-email'] as string;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.banned) {
      return res.status(400).json({ success: false, message: 'User is already banned' });
    }

    // Update user with ban information
    user.banned = true;
    user.banReason = reason || 'No reason provided';
    user.bannedAt = new Date();
    await userRepository.save(user);

    // Send notification to banned user
    await NotificationService.createNotification({
      userEmail: user.email,
      type: 'USER_BANNED' as any,
      title: 'Account Banned',
      message: `Your account has been banned. Reason: ${user.banReason}`,
      data: {
        reason: user.banReason,
        bannedAt: user.bannedAt,
        adminEmail: adminEmail
      },
      clubId: '', // Not applicable for user-level notifications
    });

    res.json({ 
      success: true, 
      data: user, 
      message: `User ${user.email} has been banned successfully` 
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to ban user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminEmail = req.headers['x-user-email'] as string;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.banned) {
      return res.status(400).json({ success: false, message: 'User is not banned' });
    }

    // Update user to remove ban
    user.banned = false;
    user.banReason = null;
    user.bannedAt = null;
    await userRepository.save(user);

    // Send notification to unbanned user
    await NotificationService.createNotification({
      userEmail: user.email,
      type: 'USER_UNBANNED' as any,
      title: 'Account Unbanned',
      message: 'Your account has been unbanned and you can now access all features.',
      data: {
        unbannedAt: new Date(),
        adminEmail: adminEmail
      },
      clubId: '', // Not applicable for user-level notifications
    });

    res.json({ 
      success: true, 
      data: user, 
      message: `User ${user.email} has been unbanned successfully` 
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unban user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
