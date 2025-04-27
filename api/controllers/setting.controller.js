import { promisify } from 'util';
import Setting from '../models/Setting.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const getUserSetting = async (req, res) => {
  const userId = req.userId;
  try {
    const userSetting = await Setting.findOne({ userId }).lean();
    if (!userSetting) {
      return res.status(200).json({});
    }
    return res.status(200).json(userSetting);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get UserSetting' });
  }
};

export const updateUserSetting = async (req, res) => {
  const userId = req.userId;
  const { scaleValue, scaleX, scaleY } = req.body;

  try {
    let userSetting = await Setting.findOne({ userId });

    if (!userSetting) {
      userSetting = await Setting.create({
        userId,
        scaleValue,
        scaleX,
        scaleY
      });
      return res.status(201).json({ message: 'User setting created successfully', data: userSetting });
    }

    userSetting.scaleValue = scaleValue;
    userSetting.scaleX = scaleX;
    userSetting.scaleY = scaleY;

    await userSetting.save();
    res.status(200).json({ message: 'User setting updated successfully', data: userSetting });
  } catch (error) {
    console.error('Error updating user setting:', error);
    res.status(500).json({ message: 'Failed to update user setting' });
  }
};

export const uploadFileUserSetting = async (req, res) => {
  const userId = req.userId;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid format' });
    }
    let userSetting = await Setting.findOne({ userId });

    if (!userSetting) {
      userSetting = await Setting.create({
        userId,
        mapImage: req.file.filename
      });
      return res.status(201).json({ message: 'Upload successful', data: userSetting });
    }

    if (userSetting?.mapImage) {
      const removeFilePromise = promisify(fs.unlink);
      try {
        await removeFilePromise(path.resolve(__dirname, `../../client/public/${userSetting.mapImage}`));
      } catch (error) {
        console.log(`Không tìm thấy file: ${userSetting.mapImage}`);
      }
    }
    userSetting.mapImage = req.file.filename;
    await userSetting.save();
    res.status(200).json({ message: 'Upload successful', filename: req.file.filename });
  } catch (error) {
    console.error('Error upload file user setting:', error);
    res.status(500).json({ message: 'Failed to upload file user setting' });
  }
};
