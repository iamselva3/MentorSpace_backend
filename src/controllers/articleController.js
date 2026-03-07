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

    // Parse contentBlocks if it's a string
    if (articleData.contentBlocks && typeof articleData.contentBlocks === 'string') {
        try {
            articleData.contentBlocks = JSON.parse(articleData.contentBlocks);
        } catch (e) {
            throw new AppError('Invalid contentBlocks format', 400);
        }
    }

    console.log('📦 Content blocks before update:', JSON.stringify(articleData.contentBlocks, null, 2));

    if (req.files) {
        console.log('📁 Uploaded files keys:', Object.keys(req.files));
        console.log('📁 Request body keys:', Object.keys(req.body));

        // Process images - look for index fields in the pattern index_images_X
        if (req.files.images) {
            req.files.images.forEach((file, idx) => {
                // Try to find the index for this image from various possible field names
                let blockIndex = null;

                // Check multiple possible field name patterns
                const possibleFieldNames = [
                    `index_images_${idx}`,
                    `images_index_${idx}`,
                    `index_images_${file.originalname}`,
                    `images_index`
                ];

                for (const fieldName of possibleFieldNames) {
                    if (req.body[fieldName] !== undefined) {
                        blockIndex = parseInt(req.body[fieldName]);
                        console.log(`🔍 Found index ${blockIndex} in field: ${fieldName}`);
                        break;
                    }
                }

                // If still not found, try to find any field that might contain the index
                if (blockIndex === null) {
                    for (const key in req.body) {
                        if (key.includes('index') && key.includes('image')) {
                            blockIndex = parseInt(req.body[key]);
                            console.log(`🔍 Found index in alternative field: ${key} = ${blockIndex}`);
                            break;
                        }
                    }
                }

                console.log(`🖼️ Processing image ${idx} -> Target Block Index:`, blockIndex);

                // Validate and update
                if (blockIndex !== null && !isNaN(blockIndex) && articleData.contentBlocks[blockIndex]) {
                    if (articleData.contentBlocks[blockIndex].type === 'image') {
                        articleData.contentBlocks[blockIndex].content = file.location;
                        console.log(`✅ Success: Updated image block ${blockIndex} with URL: ${file.location}`);
                    } else {
                        console.error(`❌ Error: Block ${blockIndex} is type '${articleData.contentBlocks[blockIndex].type}', but received an image file.`);
                        // Try to find the first image block as fallback
                        const firstImageBlock = articleData.contentBlocks.findIndex(b => b.type === 'image' && !b.content);
                        if (firstImageBlock !== -1) {
                            articleData.contentBlocks[firstImageBlock].content = file.location;
                            console.log(`⚠️ Fallback: Updated first available image block ${firstImageBlock}`);
                        } else {
                            throw new AppError('No suitable image block found', 400);
                        }
                    }
                } else {
                    console.error(`❌ Error: Invalid block index: ${blockIndex}`);
                    // Try to find the first image block as fallback
                    const firstImageBlock = articleData.contentBlocks.findIndex(b => b.type === 'image' && !b.content);
                    if (firstImageBlock !== -1) {
                        articleData.contentBlocks[firstImageBlock].content = file.location;
                        console.log(`⚠️ Fallback: Updated first available image block ${firstImageBlock}`);
                    } else {
                        throw new AppError('No suitable image block found', 400);
                    }
                }
            });
        }

        // Process videos (similar pattern)
        if (req.files.videos) {
            req.files.videos.forEach((file, idx) => {
                let blockIndex = null;

                const possibleFieldNames = [
                    `index_videos_${idx}`,
                    `videos_index_${idx}`,
                    `index_videos`
                ];

                for (const fieldName of possibleFieldNames) {
                    if (req.body[fieldName] !== undefined) {
                        blockIndex = parseInt(req.body[fieldName]);
                        break;
                    }
                }

                if (blockIndex !== null && !isNaN(blockIndex) && articleData.contentBlocks[blockIndex]) {
                    if (articleData.contentBlocks[blockIndex].type === 'video') {
                        articleData.contentBlocks[blockIndex].content = file.location;
                        console.log(`✅ Updated video block ${blockIndex}`);
                    }
                } else {
                    // Fallback to first video block
                    const firstVideoBlock = articleData.contentBlocks.findIndex(b => b.type === 'video' && !b.content);
                    if (firstVideoBlock !== -1) {
                        articleData.contentBlocks[firstVideoBlock].content = file.location;
                    }
                }
            });
        }

        // Process 3D objects (similar pattern)
        if (req.files.objects) {
            req.files.objects.forEach((file, idx) => {
                let blockIndex = null;

                const possibleFieldNames = [
                    `index_objects_${idx}`,
                    `objects_index_${idx}`,
                    `index_objects`
                ];

                for (const fieldName of possibleFieldNames) {
                    if (req.body[fieldName] !== undefined) {
                        blockIndex = parseInt(req.body[fieldName]);
                        break;
                    }
                }

                if (blockIndex !== null && !isNaN(blockIndex) && articleData.contentBlocks[blockIndex]) {
                    if (articleData.contentBlocks[blockIndex].type === '3d-object') {
                        articleData.contentBlocks[blockIndex].content = file.location;
                        console.log(`✅ Updated 3D block ${blockIndex}`);
                    }
                } else {
                    // Fallback to first 3D block
                    const first3DBlock = articleData.contentBlocks.findIndex(b => b.type === '3d-object' && !b.content);
                    if (first3DBlock !== -1) {
                        articleData.contentBlocks[first3DBlock].content = file.location;
                    }
                }
            });
        }
    }

    console.log('📦 Content blocks after update:', JSON.stringify(articleData.contentBlocks, null, 2));

    // Validate that all content blocks have content
    const missingContent = articleData.contentBlocks.findIndex(b => !b.content);
    if (missingContent !== -1) {
        console.error(`❌ Block ${missingContent} has no content`);
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
    console.log('📦 UPDATE CONTROLLER - req.body:', req.body);
    console.log('📦 UPDATE CONTROLLER - req.files:', req.files);

    let articleData = { ...req.body };

    // Parse contentBlocks if it's a string (coming from FormData)
    if (req.body.contentBlocks && typeof req.body.contentBlocks === 'string') {
        try {
            articleData.contentBlocks = JSON.parse(req.body.contentBlocks);
            console.log('✅ Parsed contentBlocks:', articleData.contentBlocks);
        } catch (e) {
            console.error('❌ Failed to parse contentBlocks:', e);
            throw new AppError('Invalid contentBlocks format', 400);
        }
    } else {
        articleData.contentBlocks = req.body.contentBlocks || [];
    }

    // Parse tags if they're a string
    if (req.body.tags && typeof req.body.tags === 'string') {
        try {
            articleData.tags = JSON.parse(req.body.tags);
            console.log('✅ Parsed tags:', articleData.tags);
        } catch (e) {
            articleData.tags = [];
        }
    } else {
        articleData.tags = req.body.tags || [];
    }

    console.log('📦 Content blocks before file update:', JSON.stringify(articleData.contentBlocks, null, 2));

    // Handle file uploads if present
    if (req.files && req.files.images) {
        console.log('📁 Processing uploaded images:', req.files.images.length);

        req.files.images.forEach((file, idx) => {
            // Get the block index from the field name pattern: index_images_X
            const blockIndex = parseInt(req.body[`index_images_${idx}`]);

            console.log(`🖼️ Processing image ${idx} -> Target Block Index: ${blockIndex}`);
            console.log(`🖼️ File location: ${file.location}`);

            // Validate and update
            if (!isNaN(blockIndex) && articleData.contentBlocks && articleData.contentBlocks[blockIndex]) {
                articleData.contentBlocks[blockIndex].content = file.location;
                console.log(`✅ Updated image block ${blockIndex} with URL`);
            } else {
                console.error(`❌ Invalid block index for image: ${blockIndex}`);
                // Try to find first image block without content as fallback
                const firstImageBlock = articleData.contentBlocks.findIndex(b => b.type === 'image' && !b.content);
                if (firstImageBlock !== -1) {
                    articleData.contentBlocks[firstImageBlock].content = file.location;
                    console.log(`⚠️ Fallback: Updated first image block ${firstImageBlock}`);
                }
            }
        });
    }

    console.log('📦 Final content blocks:', JSON.stringify(articleData.contentBlocks, null, 2));

    // Prepare the update data
    const updatePayload = {
        title: articleData.title,
        category: articleData.category,
        description: articleData.description,
        coverImage: articleData.coverImage,
        tags: articleData.tags || [],
        contentBlocks: articleData.contentBlocks || []
    };

    console.log('📦 Sending to use case:', JSON.stringify(updatePayload, null, 2));

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