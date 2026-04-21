"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativePath = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("../config/app"));
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'misc';
        if (file.fieldname === 'image')
            folder = 'images';
        else if (file.fieldname === 'documents')
            folder = 'documents';
        const uploadPath = path_1.default.join(app_1.default.upload.path, folder);
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images (JPEG, PNG, WebP) and PDF files are allowed'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: app_1.default.upload.maxSize },
});
// Pre-configured upload middleware
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
const uploadMultiple = (fieldName, maxCount = 5) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
const uploadFields = (fields) => exports.upload.fields(fields);
exports.uploadFields = uploadFields;
// Get relative path from absolute path for DB storage
const getRelativePath = (absolutePath) => {
    return absolutePath.replace(process.cwd(), '').replace(/\\/g, '/');
};
exports.getRelativePath = getRelativePath;
//# sourceMappingURL=upload.js.map