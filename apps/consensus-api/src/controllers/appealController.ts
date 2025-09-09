import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Appeal } from '../entities/Appeal';
import { User } from '../entities/User';

const appealRepository = AppDataSource.getRepository(Appeal);
const userRepository = AppDataSource.getRepository(User);

// Create an appeal for a banned user
export const createAppeal = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userEmail = req.headers['x-user-email'] as string;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Appeal message is required'
      });
    }

    // Get the user
    const user = await userRepository.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is banned
    if (!user.banned) {
      return res.status(400).json({
        success: false,
        message: 'Only banned users can submit appeals'
      });
    }

    // Check if user already has an appeal
    const existingAppeal = await appealRepository.findOne({
      where: { userId: user.id }
    });

    if (existingAppeal) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an appeal'
      });
    }

    // Create the appeal
    const appeal = new Appeal();
    appeal.userId = user.id;
    appeal.message = message.trim();

    const savedAppeal = await appealRepository.save(appeal);

    res.json({
      success: true,
      data: savedAppeal,
      message: 'Appeal submitted successfully'
    });
  } catch (error) {
    console.error('Error creating appeal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appeal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get appeal for current user
export const getMyAppeal = async (req: Request, res: Response) => {
  try {
    const userEmail = req.headers['x-user-email'] as string;

    const user = await userRepository.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const appeal = await appealRepository.findOne({
      where: { userId: user.id },
      relations: ['readByUser']
    });

    res.json({
      success: true,
      data: appeal
    });
  } catch (error) {
    console.error('Error getting appeal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appeal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all appeals (admin only)
export const getAllAppeals = async (req: Request, res: Response) => {
  try {
    const appeals = await appealRepository.find({
      relations: ['user', 'readByUser'],
      order: {
        isRead: 'ASC',
        createdAt: 'DESC'
      }
    });

    res.json({
      success: true,
      data: appeals
    });
  } catch (error) {
    console.error('Error getting appeals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appeals',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mark appeal as read/unread (admin only)
export const updateAppealStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    const adminEmail = req.headers['x-user-email'] as string;

    const appeal = await appealRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: 'Appeal not found'
      });
    }

    // Get admin user
    const adminUser = await userRepository.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    appeal.isRead = isRead;
    appeal.readByUserId = isRead ? adminUser.id : null;
    appeal.readAt = isRead ? new Date() : null;

    const updatedAppeal = await appealRepository.save(appeal);

    res.json({
      success: true,
      data: updatedAppeal,
      message: `Appeal marked as ${isRead ? 'read' : 'unread'}`
    });
  } catch (error) {
    console.error('Error updating appeal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appeal status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete appeal (when user is unbanned)
export const deleteAppeal = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const appeal = await appealRepository.findOne({
      where: { userId }
    });

    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: 'Appeal not found'
      });
    }

    await appealRepository.remove(appeal);

    res.json({
      success: true,
      message: 'Appeal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appeal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appeal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
