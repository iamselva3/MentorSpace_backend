import Analytics from '../models/Analytics.js';
import BaseRepository from './baseRepository.js';
import mongoose from 'mongoose';

class AnalyticsRepository extends BaseRepository {
    constructor() {
        super(Analytics);
    }

    async trackView(articleId, studentId) {
        return await this.model.findOneAndUpdate(
            { articleId, studentId },
            {
                $inc: { views: 1 },
                $set: { lastViewed: new Date() },
                $push: {
                    sessions: {
                        startTime: new Date(),
                        endTime: null
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    async updateDuration(articleId, studentId, duration) {
        return await this.model.findOneAndUpdate(
            { articleId, studentId },
            {
                $inc: { duration },
                $set: { 'sessions.$[elem].endTime': new Date(), 'sessions.$[elem].duration': duration }
            },
            {
                arrayFilters: [{ 'elem.endTime': null }],
                new: true
            }
        );
    }

    async getTeacherAnalytics(teacherId) {
        console.log('📊 Getting analytics for teacher:', teacherId);

        return await this.aggregate([

            {
                $lookup: {
                    from: 'articles',
                    localField: 'articleId',
                    foreignField: '_id',
                    as: 'article'
                }
            },

            { $unwind: '$article' },

            {
                $match: {
                    'article.createdBy': new mongoose.Types.ObjectId(teacherId)
                }
            },

            {
                $group: {
                    _id: '$articleId',
                    title: { $first: '$article.title' },
                    category: { $first: '$article.category' },
                    totalViews: { $sum: '$views' },
                    uniqueStudents: { $addToSet: '$studentId' },
                    totalDuration: { $sum: '$duration' }
                }
            }
        ]);
    }


    async countAll() {
        return await this.model.countDocuments();
    }

    async findAll() {
        return await this.model.find().populate('articleId');
    }

    async getStudentAnalytics(studentId) {
        console.log('Getting analytics for student:', studentId);

        const records = await this.model.find({ studentId })
            .populate('articleId', 'category title')
            .lean();

        console.log(`Found ${records.length} analytics records`);

        // Debug: Log all sessions
        records.forEach((record, idx) => {
            console.log(`Record ${idx + 1}: Article ${record.articleId?.title}`);
            if (record.sessions && Array.isArray(record.sessions)) {
                console.log(`  Sessions: ${record.sessions.length}`);
                record.sessions.forEach((session, sIdx) => {
                    console.log(`    Session ${sIdx + 1}: ${session.duration} seconds`);
                });
            }
        });

        const categoryMap = {};
        let totalDuration = 0;

        records.forEach(record => {
            const category = record.articleId?.category || 'Uncategorized';

            if (!categoryMap[category]) {
                categoryMap[category] = {
                    totalDuration: 0,
                    articlesRead: new Set(), // Use Set to count unique articles
                    totalViews: 0,
                    sessionCount: 0,
                    sessions: [] // Store individual sessions for debugging
                };
            }

            // Add to unique articles set
            if (record.articleId?._id) {
                categoryMap[category].articlesRead.add(record.articleId._id.toString());
            }

            // Add views
            categoryMap[category].totalViews += record.views || 1;

            // Process each session individually
            if (record.sessions && Array.isArray(record.sessions)) {
                record.sessions.forEach(session => {
                    const sessionDuration = session.duration || 0;
                    categoryMap[category].totalDuration += sessionDuration;
                    categoryMap[category].sessionCount++;
                    categoryMap[category].sessions.push({
                        duration: sessionDuration,
                        date: session.startTime || record.date
                    });
                    totalDuration += sessionDuration;

                    console.log(`Added session: ${sessionDuration} seconds to ${category}`);
                });
            } else {
                // Fallback to top-level duration
                const duration = record.duration || 0;
                categoryMap[category].totalDuration += duration;
                categoryMap[category].sessionCount++;
                totalDuration += duration;
            }
        });

        // Convert to array format
        const result = Object.entries(categoryMap).map(([category, data]) => ({
            _id: category,
            category: category,
            totalDuration: data.totalDuration,
            articlesRead: data.articlesRead.size, // Use Set size for unique articles
            totalViews: data.totalViews,
            sessionCount: data.sessionCount,
            averageSessionDuration: Math.round(data.totalDuration / data.sessionCount) || 0,
            // Include last 5 sessions for debugging
            recentSessions: data.sessions.slice(-5)
        }));

        console.log('Total duration from all sessions:', totalDuration);
        console.log('Category analytics:', JSON.stringify(result, null, 2));

        return result;
    }

    // Manual calculation as fallback
    async calculateManually(studentId) {
        const records = await this.model.find({ studentId })
            .populate('articleId', 'category')
            .lean();

        const categoryMap = {};

        records.forEach(record => {
            const category = record.articleId?.category || 'Uncategorized';

            if (!categoryMap[category]) {
                categoryMap[category] = {
                    totalDuration: 0,
                    articlesRead: 0,
                    totalViews: 0
                };
            }

            // Sum from sessions
            if (record.sessions && Array.isArray(record.sessions)) {
                record.sessions.forEach(session => {
                    categoryMap[category].totalDuration += session.duration || 0;
                });
            } else {
                categoryMap[category].totalDuration += record.duration || 0;
            }

            categoryMap[category].articlesRead += 1;
            categoryMap[category].totalViews += record.views || 1;
        });

        // Convert to array format
        const result = Object.entries(categoryMap).map(([category, data]) => ({
            _id: category,
            category: category,
            totalDuration: data.totalDuration,
            articlesRead: data.articlesRead,
            totalViews: data.totalViews
        }));


        return result;
    }
    async getDailyEngagement(teacherId, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);


        // First, get ALL analytics to see what's available
        const allAnalytics = await this.model.find().populate('articleId');


        // Filter manually to see what should match
        const teacherObjectId = typeof teacherId === 'string'
            ? new mongoose.Types.ObjectId(teacherId)
            : teacherId;

        const matching = allAnalytics.filter(a =>
            a.articleId &&
            a.articleId.createdBy &&
            a.articleId.createdBy.toString() === teacherObjectId.toString() &&
            a.lastViewed >= startDate
        );



        // Now run the actual aggregation
        return await this.aggregate([
            {
                $lookup: {
                    from: 'articles',
                    localField: 'articleId',
                    foreignField: '_id',
                    as: 'article'
                }
            },
            { $unwind: '$article' },
            {
                $match: {
                    'article.createdBy': teacherObjectId,
                    'lastViewed': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$lastViewed' } }
                    },
                    views: { $sum: '$views' },
                    uniqueStudents: { $addToSet: '$studentId' },
                    totalDuration: { $sum: '$duration' }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);
    }

    async findRecent(limit = 5) {
        return await this.model.find()
            .sort('-createdAt')
            .limit(limit)
            .populate('createdBy', 'name email');
    }

    async findByStudentAndArticle(studentId, articleId) {
        return await this.findOne({ studentId, articleId });
    }
    async deleteMany(filter) {
        return await this.model.deleteMany(filter);
    }
}

export default new AnalyticsRepository();