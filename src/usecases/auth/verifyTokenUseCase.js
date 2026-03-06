import jwt from 'jsonwebtoken';
import userRepository from '../../repositories/userRepository.js';
import AppError from '../../utils/AppError.js';

class VerifyTokenUseCase {
    
    async execute(token) {
        try {
           
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

         
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                throw new AppError('The user belonging to this token no longer exists.', 401);
            }

           
            user.password = undefined;

            return {
                valid: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token has expired', 401);
            } else if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid token', 401);
            } else {
                throw error;
            }
        }
    }

    extractTokenFromHeader(authorization) {
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return null;
        }
        return authorization.split(' ')[1];
    }

    
    async verifyRequest(req) {
        const token = this.extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            throw new AppError('No token provided', 401);
        }

        return await this.execute(token);
    }

    
    async refreshToken(oldToken) {
        try {
            const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });

            const user = await userRepository.findById(decoded.id);
            if (!user) {
                throw new AppError('User not found', 401);
            }

            const newToken = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            return {
                token: newToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            throw new AppError('Invalid refresh token', 401);
        }
    }
}

export default new VerifyTokenUseCase();