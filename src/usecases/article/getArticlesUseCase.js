import articleRepository from '../../repositories/articleRepository.js';

class GetArticlesUseCase {
    async execute(filters = {}, userRole, userId) {
        let query = {};

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.search) {
            return await articleRepository.searchArticles(filters.search);
        }

        if (userRole === 'teacher') {
            query.createdBy = userId;
        }

        return await articleRepository.find(query, 'createdBy');
    }
}

export default new GetArticlesUseCase();