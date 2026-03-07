import Highlight from '../models/Highlight.js';
import BaseRepository from './baseRepository.js';

class HighlightRepository extends BaseRepository {
    constructor() {
        super(Highlight);
    }

    async findByStudent(studentId) {
        return await this.find({ studentId }, 'articleId', '-timestamp');
    }

    async findByArticle(articleId) {
        return await this.find({ articleId }, 'studentId', '-timestamp');
    }

    async findByStudentAndArticle(studentId, articleId) {
        return await this.find({ studentId, articleId }, '', 'timestamp');
    }

    async deleteHighlight(studentId, highlightId) {
        return await this.delete({ _id: highlightId, studentId });
    }

    async findByStudentAndArticle(studentId, articleId) {
        return await this.find({ studentId, articleId }, '', 'timestamp');
    }
    async deleteMany(filter) {
        return await this.model.deleteMany(filter);
    }
}

export default new HighlightRepository();