class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populate = '') {
    if (typeof id === 'object' && id._id) {
      // console.warn('Warning: Passing entire object to findById. Fix your code!');
      id = id._id;
    }
    return await this.model.findById(id).populate(populate);
  }



  async findByIdForStats(articleId) {

    
    if (articleId && typeof articleId === 'object') {
      if (articleId._id) {
        articleId = articleId._id;
      } else {
      
        console.log(' Object without _id, converting to string');
        articleId = articleId.toString();
      }
    }

   
    if (typeof articleId === 'string' && (articleId.includes('{') || articleId.includes('ObjectId'))) {
      
      const match = articleId.match(/[a-f0-9]{24}/);
      if (match) {
        console.log(' Extracted ID from string:', match[0]);
        articleId = match[0];
      }
    }

    return await this.model.findById(articleId);
  }

  async findOne(filter, populate = '') {
    return await this.model.findOne(filter).populate(populate);
  }

  async find(filter = {}, populate = '', sort = '-createdAt', limit = null) {
    let query = this.model.find(filter).populate(populate).sort(sort);
    if (limit) query = query.limit(limit);
    return await query;
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }
}

export default BaseRepository;