import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    lastViewed: {
        type: Date,
        default: Date.now
    },
    sessions: [{
        startTime: Date,
        endTime: Date,
        duration: Number
    }],
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
});

analyticsSchema.index({ articleId: 1, studentId: 1 }, { unique: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;