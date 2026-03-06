import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    position: {
        start: Number,
        end: Number
    },
    color: {
        type: String,
        default: '#ffeb3b'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Highlight = mongoose.model('Highlight', highlightSchema);
export default Highlight;