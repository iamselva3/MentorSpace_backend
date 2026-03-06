import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Analytics from '../models/Analytics.js';
import Highlight from '../models/Highlight.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany();
        await Article.deleteMany();
        await Analytics.deleteMany();
        await Highlight.deleteMany();

        const teachers = await User.create([
            {
                name: 'John Teacher',
                email: 'teacher@example.com',
                password: 'password123',
                role: 'teacher'
            },
            {
                name: 'Jane Teacher',
                email: 'jane.teacher@example.com',
                password: 'password123',
                role: 'teacher'
            }
        ]);

        const students = await User.create([
            {
                name: 'Alice Student',
                email: 'student@example.com',
                password: 'password123',
                role: 'student'
            },
            {
                name: 'Bob Student',
                email: 'bob@example.com',
                password: 'password123',
                role: 'student'
            }
        ]);

        const articles = await Article.create([
            {
                title: 'Introduction to Quantum Physics',
                category: 'Science',
                contentBlocks: [
                    {
                        type: 'text',
                        content: 'Quantum physics is the study of matter and energy at the most fundamental level...',
                        order: 1
                    },
                    {
                        type: 'image',
                        content: 'https://example.com/quantum.jpg',
                        order: 2,
                        metadata: { caption: 'Quantum particle visualization' }
                    }
                ],
                createdBy: teachers[0]._id,
                totalViews: 150,
                uniqueStudents: [students[0]._id, students[1]._id]
            },
            {
                title: 'Calculus Fundamentals',
                category: 'Math',
                contentBlocks: [
                    {
                        type: 'text',
                        content: 'Calculus is the mathematical study of continuous change...',
                        order: 1
                    },
                    {
                        type: '3d-object',
                        content: 'https://example.com/3d-function.glb',
                        order: 2,
                        metadata: { modelType: '3d-function-graph' }
                    }
                ],
                createdBy: teachers[0]._id,
                totalViews: 98,
                uniqueStudents: [students[0]._id]
            },
            {
                title: 'English Literature: Shakespeare',
                category: 'English',
                contentBlocks: [
                    {
                        type: 'text',
                        content: 'William Shakespeare was an English playwright, poet and actor...',
                        order: 1
                    },
                    {
                        type: 'video',
                        content: 'https://example.com/shakespeare.mp4',
                        order: 2,
                        metadata: { duration: '15:30' }
                    }
                ],
                createdBy: teachers[1]._id,
                totalViews: 200,
                uniqueStudents: [students[0]._id, students[1]._id]
            }
        ]);

        const now = new Date();
        const analyticsData = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            students.forEach(student => {
                articles.forEach(article => {
                    if (Math.random() > 0.3) {
                        analyticsData.push({
                            articleId: article._id,
                            studentId: student._id,
                            views: Math.floor(Math.random() * 5) + 1,
                            duration: Math.floor(Math.random() * 600) + 60,
                            date: date,
                            lastViewed: date
                        });
                    }
                });
            });
        }

        await Analytics.insertMany(analyticsData);

        await Highlight.create([
            {
                studentId: students[0]._id,
                articleId: articles[0]._id,
                text: 'Quantum entanglement is a key concept...',
                note: 'Need to research more about this',
                color: '#ffeb3b'
            },
            {
                studentId: students[0]._id,
                articleId: articles[1]._id,
                text: 'The derivative measures the rate of change...',
                note: 'Important for physics applications',
                color: '#4caf50'
            },
            {
                studentId: students[1]._id,
                articleId: articles[2]._id,
                text: 'To be or not to be, that is the question',
                note: 'Famous soliloquy from Hamlet',
                color: '#2196f3'
            }
        ]);

        console.log('Database seeded successfully');
        console.log('\nTest Credentials:');
        console.log('Teacher - email: teacher@example.com, password: password123');
        console.log('Student - email: student@example.com, password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();