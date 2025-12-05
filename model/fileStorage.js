const multer = require('multer');

function fileFilter(req, file, cb) {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype))
        cb(null, true);
    else
        cb(null, false);
}

const upload = multer({
    storage: multer.memoryStorage(),  // ✅ STORE IN RAM
    fileFilter
});

module.exports = upload;
