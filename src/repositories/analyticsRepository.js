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

        const records = await this.model.find({ studentId })
            .populate('articleId', 'category title')
            .lean();

        console.log(`Found ${records.length} analytics records`);

        records.forEach((record, idx) => {
            if (record.sessions && Array.isArray(record.sessions)) {
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
                    articlesRead: new Set(),
                    totalViews: 0,
                    sessionCount: 0,
                    sessions: []
                };
            }


            if (record.articleId?._id) {
                categoryMap[category].articlesRead.add(record.articleId._id.toString());
            }


            categoryMap[category].totalViews += record.views || 1;


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


                });
            } else {
                // Fallback to top-level duration
                const duration = record.duration || 0;
                categoryMap[category].totalDuration += duration;
                categoryMap[category].sessionCount++;
                totalDuration += duration;
            }
        });


        const result = Object.entries(categoryMap).map(([category, data]) => ({
            _id: category,
            category: category,
            totalDuration: data.totalDuration,
            articlesRead: data.articlesRead.size,
            totalViews: data.totalViews,
            sessionCount: data.sessionCount,
            averageSessionDuration: Math.round(data.totalDuration / data.sessionCount) || 0,
            recentSessions: data.sessions.slice(-5)
        }));


        return result;
    }

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


        const allAnalytics = await this.model.find().populate('articleId');


        const teacherObjectId = typeof teacherId === 'string'
            ? new mongoose.Types.ObjectId(teacherId)
            : teacherId;

        const matching = allAnalytics.filter(a =>
            a.articleId &&
            a.articleId.createdBy &&
            a.articleId.createdBy.toString() === teacherObjectId.toString() &&
            a.lastViewed >= startDate
        );



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