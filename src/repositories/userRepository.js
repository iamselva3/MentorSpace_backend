import User from '../models/User.js';
import BaseRepository from './baseRepository.js';

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return await this.findOne({ email });
    }

    async findWithPassword(email) {
        return await this.model.findOne({ email }).select('+password');
    }

    async getTeachers() {
        return await this.find({ role: 'teacher' });
    }

    async getStudents() {
        return await this.find({ role: 'student' });
    }
}

export default new UserRepository();