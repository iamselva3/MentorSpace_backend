import Article from '../models/Article.js';
import BaseRepository from './baseRepository.js';

class ArticleRepository extends BaseRepository {
    constructor() {
        super(Article);
    }

    async findByTeacher(teacherId) {
        return await this.find({ createdBy: teacherId }, 'createdBy');
    }

    async findByCategory(category) {
        return await this.find({ category }, 'createdBy');
    }

    async searchArticles(query) {
        return await this.find({ $text: { $search: query } });
    }

    async incrementViews(articleId, studentId) {
        return await this.model.findByIdAndUpdate(
            articleId,
            {
                $inc: { totalViews: 1 },
                $addToSet: { uniqueStudents: studentId }
            },
            { new: true }
        );
    }

    async getCategoryStats() {
        return await this.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$totalViews' }
                }
            },
            { $sort: { totalViews: -1 } }
        ]);
    }

    async findRecent(limit = 5) {
        return await this.model.find()
            .sort('-createdAt')
            .limit(limit)
            .populate('createdBy', 'name email');
    }

    async getCategoryStats() {
        return await this.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$totalViews' }
                }
            },
            { $sort: { count: -1 } }
        ]);
    }
}

export default new ArticleRepository();