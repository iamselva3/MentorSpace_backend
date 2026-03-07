import articleRepository from '../../repositories/articleRepository.js';
import AppError from '../../utils/AppError.js';

class GetCategoryStatsUseCase {
  async execute(userId) {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const categoryStats = await articleRepository.getCategoryStats();
    
    // Format the data for the pie chart
    return categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      totalViews: stat.totalViews
    }));
  }
}

export default new GetCategoryStatsUseCase();