import userRepository from '../../repositories/userRepository.js';
import AppError from '../../utils/AppError.js';

class RegisterUseCase {
    async execute(userData) {
        const { email } = userData;

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        const user = await userRepository.create(userData);
        user.password = undefined;

        return user;
    }
}

export default new RegisterUseCase();