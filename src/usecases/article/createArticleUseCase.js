import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class CreateArticleUseCase {
    async execute(articleData, teacherId) {
        if (!teacherId) {
            throw new AppError('Teacher ID is required', 400);
        }

        const article = await articleRepository.create({
            ...articleData,
            createdBy: teacherId
        });

        return article;
    }
}

export default new CreateArticleUseCase();