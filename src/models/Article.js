import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', '3d-object', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  }
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Science', 'Math', 'English', 'History', 'Geography', 'Art', 'Technology'],
    index: true
  },
  contentBlocks: [contentBlockSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  totalViews: {
    type: Number,
    default: 0
  },
  uniqueStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

articleSchema.index({ title: 'text', category: 'text' });

const Article = mongoose.model('Article', articleSchema);
export default Article;