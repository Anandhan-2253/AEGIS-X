"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.malwareUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const allowedMimeTypes = new Set([
    'application/octet-stream',
    'application/x-dosexec',
    'application/x-msdownload',
    'application/x-elf',
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
]);
const uploadRoot = path_1.default.resolve(env_1.env.UPLOAD_DIR);
if (!fs_1.default.existsSync(uploadRoot)) {
    fs_1.default.mkdirSync(uploadRoot, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        cb(new errors_1.ValidationError(`Unsupported MIME type: ${file.mimetype}`));
        return;
    }
    cb(null, true);
};
exports.malwareUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter,
});
//# sourceMappingURL=upload.js.map