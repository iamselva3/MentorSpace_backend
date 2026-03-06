import createArticleUseCase from '../usecases/article/createArticleUseCase.js';
import getArticlesUseCase from '../usecases/article/getArticlesUseCase.js';
import updateArticleUseCase from '../usecases/article/updateArticleUseCase.js';
import deleteArticleUseCase from '../usecases/article/deleteArticleUseCase.js';
import articleRepository from '../repositories/articleRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import getRecentArticlesUseCase from '../usecases/article/getRecentArticlesUseCase.js';

export const createArticle = catchAsync(async (req, res) => {
    const article = await createArticleUseCase.execute(req.body, req.user.id);

    res.status(201).json({
        status: 'success',
        data: { article }
    });
});

export const getArticles = catchAsync(async (req, res) => {
    const articles = await getArticlesUseCase.execute(
        req.query,
        req.user.role,
        req.user.id
    );

    res.status(200).json({
        status: 'success',
        results: articles.length,
        data: { articles }
    });
});

export const getArticle = catchAsync(async (req, res) => {
    const article = await articleRepository.findById(req.params.id, 'createdBy');

    if (!article) {
        throw new AppError('Article not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: { article }
    });
});

export const updateArticle = catchAsync(async (req, res) => {
    const updatedArticle = await updateArticleUseCase.execute(
        req.params.id,
        req.body,
        req.user.id
    );

    res.status(200).json({
        status: 'success',
        data: { article: updatedArticle }
    });
});

export const deleteArticle = catchAsync(async (req, res) => {
    const result = await deleteArticleUseCase.execute(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        status: 'success',
        message: 'Article and related data deleted successfully',
        data: result
    });
});

export const getRecentArticles = catchAsync(async (req, res) => {

    const articles = await getRecentArticlesUseCase.execute(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { articles }
    });
});