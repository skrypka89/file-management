function makeDto() {
  return (req, res, next) => {
    const { originalname, mimetype, size, uploadedAt } = req.file;
    req.dto = {
      name: originalname,
      extension: originalname.split('.').slice(-1)[0].toLowerCase(),
      mimeType: mimetype,
      size,
      uploadedAt
    };
    next();
  };
}

module.exports = makeDto;
