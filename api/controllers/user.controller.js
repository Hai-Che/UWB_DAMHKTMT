import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to get all user' });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenId = req.userId;
  const role = req.role;
  const { password, avatar, ...inputs } = req.body;
  console.log(role);
  if (id !== tokenId && role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  let newPassword = null;
  try {
    if (password) {
      newPassword = await bcrypt.hash(password, 10);
    }
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        ...inputs,
        ...(newPassword && { password: newPassword }),
        ...(avatar && { avatar })
      },
      { new: true }
    );
    const { password: userPassword, ...rest } = updateUser;
    res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  const _id = req.params._id;
  const tokenId = req.userId;
  const role = req.role;
  if (_id !== tokenId && role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    await User.findByIdAndDelete({ _id });
    res.status(200).json({ message: 'Delete user successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const updateUserTable = async (req, res) => {
  try {
    const { _id, ...others } = req.body;
    const tokenId = req.userId;
    const role = req.role;
    if (_id !== tokenId && role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const othersArray = Object.entries(others);
    const filtered = othersArray.filter(([key, value]) => value !== '');
    const filteredOthers = Object.fromEntries(filtered);
    if (Object.keys(filteredOthers).length === 0) {
      return res.status(200).json('Không có field cập nhật');
    }
    const user = await User.findByIdAndUpdate({ _id }, { ...filteredOthers }, { new: true });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
  }
};
