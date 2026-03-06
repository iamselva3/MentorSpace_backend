import userRepository from '../../repositories/userRepository.js';
import { generateToken } from '../../config/jwt.js';
import AppError from '../../utils/AppError.js';

class LoginUseCase {
    async execute(email, password) {
        const user = await userRepository.findWithPassword(email);

        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = generateToken(user._id, user.role);

        user.password = undefined;

        return { user, token };
    }
}

export default new LoginUseCase();