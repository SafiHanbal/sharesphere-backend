class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // Filtering
    const queryObj = { ...this.queryStr };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limit() {
    if (this.queryStr.fields) {
      const limitFields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(limitFields);
    }
    return this;
  }

  paginate() {
    if (this.queryStr.page) {
      const page = this.queryStr.page;
      const limit = this.queryStr.limit || 20;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

export default APIFeatures;
