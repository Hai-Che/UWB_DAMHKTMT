import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { updateUser, getUsers, deleteUser, updateUserTable } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUsers);
router.put('/table-user', verifyToken, updateUserTable);
router.put('/:id', verifyToken, updateUser);

router.delete('/:_id', verifyToken, deleteUser);

export default router;
