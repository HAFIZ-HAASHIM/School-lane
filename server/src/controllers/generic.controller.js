exports.createOne = (Model) => async (req, res) => {
  const doc = await Model.create(req.body);
  res.status(201).json(doc);
};

exports.getMany = (Model, filterBuilder) => async (req, res) => {
  const filter = filterBuilder ? filterBuilder(req) : {};
  const docs = await Model.find(filter).sort({ createdAt: -1 });
  res.json(docs);
};

exports.getOne = (Model) => async (req, res) => {
  const doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
};

exports.updateOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
};

exports.deleteOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
};

