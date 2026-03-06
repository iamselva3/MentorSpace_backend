import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class GetRecentArticlesUseCase {
    async execute(userId) {
        if (!userId) {
            throw new AppError('User ID is required', 400);
        }

        const articles = await articleRepository.findRecent(5);
        return articles;
    }
}

export default new GetRecentArticlesUseCase();