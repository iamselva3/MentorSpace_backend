import createArticleUseCase from '../usecases/article/createArticleUseCase.js';
import getArticlesUseCase from '../usecases/article/getArticlesUseCase.js';
import updateArticleUseCase from '../usecases/article/updateArticleUseCase.js';
import deleteArticleUseCase from '../usecases/article/deleteArticleUseCase.js';
import articleRepository from '../repositories/articleRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import getRecentArticlesUseCase from '../usecases/article/getRecentArticlesUseCase.js';


export const createArticle = catchAsync(async (req, res) => {
    let articleData = { ...req.body };

   
    if (articleData.contentBlocks && typeof articleData.contentBlocks === 'string') {
        try {
            articleData.contentBlocks = JSON.parse(articleData.contentBlocks);
            
        } catch (e) {
            throw new AppError('Invalid contentBlocks format', 400);
        }
    }

  
    if (articleData.tags && typeof articleData.tags === 'string') {
        try {
            articleData.tags = JSON.parse(articleData.tags);
            
        } catch (e) {
            console.error('Failed to parse tags:', e);
            articleData.tags = articleData.tags.split(',').map(t => t.trim());
        }
    }

    

   

    
    const missingContent = articleData.contentBlocks.findIndex(b => !b.content);
    if (missingContent !== -1) {
        console.error(`Block ${missingContent} has no content`);
        throw new AppError(`Content block ${missingContent} (${articleData.contentBlocks[missingContent].type}) requires content`, 400);
    }

    const article = await createArticleUseCase.execute(articleData, req.user.id);

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
   

    let articleData = { ...req.body };

    
    if (req.body.contentBlocks && typeof req.body.contentBlocks === 'string') {
        try {
            articleData.contentBlocks = JSON.parse(req.body.contentBlocks);
            console.log(' Parsed contentBlocks:', articleData.contentBlocks);
        } catch (e) {
            console.error('Failed to parse contentBlocks:', e);
            throw new AppError('Invalid contentBlocks format', 400);
        }
    } else {
        articleData.contentBlocks = req.body.contentBlocks || [];
    }

    
    if (req.body.tags && typeof req.body.tags === 'string') {
        try {
            articleData.tags = JSON.parse(req.body.tags);
            
        } catch (e) {
            articleData.tags = [];
        }
    } else {
        articleData.tags = req.body.tags || [];
    }


    if (req.files && req.files.images) {
      

        req.files.images.forEach((file, idx) => {
           
            const blockIndex = parseInt(req.body[`index_images_${idx}`]);

            
            if (!isNaN(blockIndex) && articleData.contentBlocks && articleData.contentBlocks[blockIndex]) {
                articleData.contentBlocks[blockIndex].content = file.location;
                
            } else {
                console.error(`Invalid block index for image: ${blockIndex}`);
                
                const firstImageBlock = articleData.contentBlocks.findIndex(b => b.type === 'image' && !b.content);
                if (firstImageBlock !== -1) {
                    articleData.contentBlocks[firstImageBlock].content = file.location;
                    console.log(` Fallback: Updated first image block ${firstImageBlock}`);
                }
            }
        });
    }


   
    const updatePayload = {
        title: articleData.title,
        category: articleData.category,
        description: articleData.description,
        coverImage: articleData.coverImage,
        tags: articleData.tags || [],
        contentBlocks: articleData.contentBlocks || []
    };


    const updatedArticle = await updateArticleUseCase.execute(
        req.params.id,
        updatePayload,
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