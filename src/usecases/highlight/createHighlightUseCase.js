import highlightRepository from '../../repositories/highlightRepository.js';
import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class CreateHighlightUseCase {
    async execute(highlightData) {
        const { studentId, articleId, text, note, position, color } = highlightData;

        
        if (!studentId) {
            throw new AppError('Student ID is required', 400);
        }

        if (!articleId) {
            throw new AppError('Article ID is required', 400);
        }

        if (!text) {
            throw new AppError('Highlight text is required', 400);
        }

       
        const article = await articleRepository.findById(articleId);
        if (!article) {
            throw new AppError('Article not found', 404);
        }

        
        const highlight = await highlightRepository.create({
            studentId,
            articleId,
            text,
            note: note || '',
            position: position || { start: 0, end: text.length },
            color: color || '#ffeb3b',
            timestamp: new Date()
        });

        return highlight;
    }

  
    async executeBatch(highlightsData) {
        const { studentId, articleId, highlights } = highlightsData;

        if (!studentId || !articleId || !Array.isArray(highlights)) {
            throw new AppError('Invalid batch highlight data', 400);
        }

        
        const article = await articleRepository.findById(articleId);
        if (!article) {
            throw new AppError('Article not found', 404);
        }

       
        const createdHighlights = [];
        for (const highlight of highlights) {
            const newHighlight = await highlightRepository.create({
                studentId,
                articleId,
                text: highlight.text,
                note: highlight.note || '',
                position: highlight.position || { start: 0, end: highlight.text.length },
                color: highlight.color || '#ffeb3b',
                timestamp: new Date()
            });
            createdHighlights.push(newHighlight);
        }

        return createdHighlights;
    }

   
    async updateHighlight(highlightId, studentId, updateData) {
        
        const highlight = await highlightRepository.findById(highlightId);

        if (!highlight) {
            throw new AppError('Highlight not found', 404);
        }

        if (highlight.studentId.toString() !== studentId) {
            throw new AppError('You are not authorized to update this highlight', 403);
        }

        
        const allowedUpdates = {
            note: updateData.note,
            color: updateData.color,
            text: updateData.text,
            position: updateData.position
        };

        
        Object.keys(allowedUpdates).forEach(key =>
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const updatedHighlight = await highlightRepository.update(highlightId, allowedUpdates);

        return updatedHighlight;
    }
}

export default new CreateHighlightUseCase();