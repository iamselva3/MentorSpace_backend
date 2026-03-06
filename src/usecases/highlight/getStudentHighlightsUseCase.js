import highlightRepository from '../../repositories/highlightRepository.js';
import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class GetStudentHighlightsUseCase {
    async execute(studentId, filters = {}) {
        if (!studentId) {
            throw new AppError('Student ID is required', 400);
        }


        let highlights = await highlightRepository.findByStudent(studentId);


        if (filters.articleId) {
            highlights = highlights.filter(h => h.articleId.toString() === filters.articleId);
        }

        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            highlights = highlights.filter(h => new Date(h.timestamp) >= fromDate);
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            highlights = highlights.filter(h => new Date(h.timestamp) <= toDate);
        }


        const highlightsWithDetails = await Promise.all(
            highlights.map(async (highlight) => {
                const article = await articleRepository.findById(highlight.articleId);
                return {
                    ...highlight.toObject(),
                    article: article ? {
                        id: article._id,
                        title: article.title,
                        category: article.category
                    } : null
                };
            })
        );

        return highlightsWithDetails;
    }

    async getHighlightsByArticle(studentId, articleId) {
        if (!studentId || !articleId) {
            throw new AppError('Student ID and Article ID are required', 400);
        }


        const article = await articleRepository.findById(articleId);
        if (!article) {
            throw new AppError('Article not found', 404);
        }


        const highlights = await highlightRepository.findByStudentAndArticle(studentId, articleId);

        return {
            article: {
                id: article._id,
                title: article.title,
                category: article.category
            },
            highlights: highlights.map(h => ({
                id: h._id,
                text: h.text,
                note: h.note,
                color: h.color,
                position: h.position,
                timestamp: h.timestamp
            }))
        };
    }
async getHighlightStats(studentId) {
    console.log("dssdi", studentId);
    if (!studentId) {
        throw new AppError('Student ID is required', 400);
    }

    const highlights = await highlightRepository.findByStudent(studentId);

    const stats = {
        totalHighlights: highlights.length,
        highlightsByArticle: {},
        highlightsByColor: {},
        recentHighlights: [],
        mostHighlightedArticle: null
    };

    const articleCount = {};
    let maxCount = 0;
    let mostHighlightedArticleId = null;

    
    for (const highlight of highlights) {
       
        const articleId = highlight.articleId.toString();
        
      
        articleCount[articleId] = (articleCount[articleId] || 0) + 1;

        if (articleCount[articleId] > maxCount) {
            maxCount = articleCount[articleId];
            mostHighlightedArticleId = articleId;
        }

        
        const color = highlight.color || '#ffeb3b';
        stats.highlightsByColor[color] = (stats.highlightsByColor[color] || 0) + 1;
    }

    
    if (mostHighlightedArticleId) {
        const article = await articleRepository.findByIdForStats(mostHighlightedArticleId);
        stats.mostHighlightedArticle = article ? article.title : null;
    }

    
    for (const articleIdStr of Object.keys(articleCount)) {
        const count = articleCount[articleIdStr];
        const article = await articleRepository.findByIdForStats(articleIdStr);
        if (article) {
            stats.highlightsByArticle[article.title] = count;
        }
    }

    
    stats.recentHighlights = highlights
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(h => ({
            id: h._id,
            text: h.text.substring(0, 50) + (h.text.length > 50 ? '...' : ''),
            articleId: h.articleId,
            timestamp: h.timestamp
        }));

    return stats;
}


    async searchHighlights(studentId, searchTerm) {
        if (!studentId || !searchTerm) {
            throw new AppError('Student ID and search term are required', 400);
        }

        const highlights = await highlightRepository.findByStudent(studentId);

        const searchResults = highlights.filter(highlight =>
            highlight.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (highlight.note && highlight.note.toLowerCase().includes(searchTerm.toLowerCase()))
        );


        const resultsWithDetails = await Promise.all(
            searchResults.map(async (highlight) => {
                const article = await articleRepository.findById(highlight.articleId);
                return {
                    ...highlight.toObject(),
                    article: article ? {
                        id: article._id,
                        title: article.title,
                        category: article.category
                    } : null
                };
            })
        );

        return resultsWithDetails;
    }


    async exportHighlights(studentId, format = 'json') {
        if (!studentId) {
            throw new AppError('Student ID is required', 400);
        }

        const highlights = await highlightRepository.findByStudent(studentId);


        const highlightsWithDetails = await Promise.all(
            highlights.map(async (highlight) => {
                const article = await articleRepository.findById(highlight.articleId);
                return {
                    id: highlight._id,
                    text: highlight.text,
                    note: highlight.note,
                    color: highlight.color,
                    position: highlight.position,
                    timestamp: highlight.timestamp,
                    article: article ? {
                        id: article._id,
                        title: article.title,
                        category: article.category
                    } : null
                };
            })
        );

        if (format === 'json') {
            return highlightsWithDetails;
        } else if (format === 'text') {
            return highlightsWithDetails.map(h =>
                `[${h.article?.title || 'Unknown Article'}] - ${h.text}${h.note ? ` (Note: ${h.note})` : ''}`
            ).join('\n\n');
        } else {
            throw new AppError('Unsupported export format', 400);
        }
    }
}

export default new GetStudentHighlightsUseCase();