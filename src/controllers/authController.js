import registerUseCase from '../usecases/auth/registerUseCase.js';
import loginUseCase from '../usecases/auth/loginUseCase.js';
import verifyTokenUseCase from '../usecases/auth/verifyTokenUseCase.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const register = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new AppError('Please provide all required fields', 400);
    }

    const user = await registerUseCase.execute({ name, email, password, role });

    res.status(201).json({
        status: 'success',
        data: { user }
    });
});

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const { user, token } = await loginUseCase.execute(email, password);

    res.status(200).json({
        status: 'success',
        data: { user, token }
    });
});

export const verifyToken = catchAsync(async (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];


    const result = await verifyTokenUseCase.execute(token);

    res.status(200).json({
        status: 'success',
        data: result
    });
});


export const logout = catchAsync(async (req, res) => {

    
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});