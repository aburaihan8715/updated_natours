class APIFeatures {
  constructor(modelQuery, queryObj) {
    this.modelQuery = modelQuery;
    this.queryObj = queryObj;
  }

  // search
  search(searchAbleFields = []) {
    if (this.queryObj.searchTerm) {
      const searchTermValue = this.queryObj.searchTerm;
      this.modelQuery = this.modelQuery.find({
        $or: searchAbleFields.map((field) => ({
          [field]: { $regex: searchTermValue, $options: 'i' },
        })),
      });
    }

    return this;
  }

  // filter
  filter() {
    // 1. basic filter
    let filterObj = { ...this.queryObj };
    const excludeFields = [
      'searchTerm',
      'page',
      'limit',
      'fields',
      'sort',
    ];
    excludeFields.forEach((item) => delete filterObj[item]);
    // 2. advanced filter
    const filterObjString = JSON.stringify(filterObj).replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`,
    );

    filterObj = JSON.parse(filterObjString);

    this.modelQuery = this.modelQuery.find(filterObj);

    return this;
  }

  // sort
  sort() {
    const sortObj = this.queryObj.sort
      ? this.queryObj.sort.split(',').join(' ')
      : '-createdAt';
    this.modelQuery = this.modelQuery.sort(sortObj);

    return this;
  }
  // fields
  fields() {
    const fieldsObj = this.queryObj.fields
      ? this.queryObj.fields.split(',').join(' ')
      : '-__v';
    this.modelQuery = this.modelQuery.select(fieldsObj);

    return this;
  }
  // paginate
  paginate() {
    const paginateObj = { ...this.queryObj };
    // it ensure no negative values
    const page = Math.max(1, parseInt(paginateObj.page) || 1);
    const limit = Math.max(1, parseInt(paginateObj.limit) || 10);
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }
  // calculate pagination
  async calculatePaginate() {
    const paginateObj = { ...this.queryObj };
    // it ensure no negative values
    const page = Math.max(1, parseInt(paginateObj.page) || 1);
    const limit = Math.max(1, parseInt(paginateObj.limit) || 10);
    const finalFilter = await this.modelQuery.getFilter();
    const totalDocs =
      await this.modelQuery.model.countDocuments(finalFilter);

    const totalPage = Math.ceil(totalDocs / limit);

    return { page, limit, totalDocs, totalPage };
  }
}

module.exports = APIFeatures;
