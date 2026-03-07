import createHighlightUseCase from '../usecases/highlight/createHighlightUseCase.js';
import getStudentHighlightsUseCase from '../usecases/highlight/getStudentHighlightsUseCase.js';
import highlightRepository from '../repositories/highlightRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const createHighlight = catchAsync(async (req, res) => {
    const highlight = await createHighlightUseCase.execute({
        ...req.body,
        studentId: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: { highlight }
    });
});

export const createBatchHighlights = catchAsync(async (req, res) => {
    const highlights = await createHighlightUseCase.executeBatch({
        studentId: req.user.id,
        articleId: req.body.articleId,
        highlights: req.body.highlights
    });

    res.status(201).json({
        status: 'success',
        data: { highlights }
    });
});


export const updateHighlight = catchAsync(async (req, res) => {
    const highlight = await createHighlightUseCase.updateHighlight(
        req.params.id,
        req.user.id,
        req.body
    );

    res.status(200).json({
        status: 'success',
        data: { highlight }
    });
});

export const getStudentHighlights = catchAsync(async (req, res) => {
    const highlights = await getStudentHighlightsUseCase.execute(
        req.user.id,
        req.query 
    );

    res.status(200).json({
        status: 'success',
        results: highlights.length,
        data: { highlights }
    });
});

export const getArticleHighlights = catchAsync(async (req, res) => {
    const { articleId } = req.params;

    const data = await getStudentHighlightsUseCase.getHighlightsByArticle(
        req.user.id,
        articleId
    );

    res.status(200).json({
        status: 'success',
        data
    });
});


export const getHighlightStats = catchAsync(async (req, res) => {
    const stats = await getStudentHighlightsUseCase.getHighlightStats(req.user.id);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

export const searchHighlights = catchAsync(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new AppError('Search term is required', 400);
    }

    const results = await getStudentHighlightsUseCase.searchHighlights(req.user.id, q);

    res.status(200).json({
        status: 'success',
        results: results.length,
        data: { highlights: results }
    });
});

// Export highlights
export const exportHighlights = catchAsync(async (req, res) => {
    const { format } = req.query;

    const data = await getStudentHighlightsUseCase.exportHighlights(
        req.user.id,
        format || 'json'
    );

    if (format === 'text') {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=highlights.txt');
        return res.send(data);
    }

    res.status(200).json({
        status: 'success',
        data
    });
});

// Delete a highlight
export const deleteHighlight = catchAsync(async (req, res) => {
    const highlight = await highlightRepository.deleteHighlight(
        req.user.id,
        req.params.id
    );

    if (!highlight) {
        throw new AppError('Highlight not found or not authorized', 404);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});