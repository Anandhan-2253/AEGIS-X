"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = hashString;
exports.generateSecureToken = generateSecureToken;
exports.computeFileMD5 = computeFileMD5;
exports.computeFileSHA256 = computeFileSHA256;
exports.calculateEntropy = calculateEntropy;
exports.extractStrings = extractStrings;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
function hashString(value) {
    return crypto_1.default.createHash('sha256').update(value).digest('hex');
}
function generateSecureToken(bytes = 48) {
    return crypto_1.default.randomBytes(bytes).toString('hex');
}
function computeFileMD5(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('md5');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}
function computeFileSHA256(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('sha256');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}
function calculateEntropy(buffer) {
    const counts = new Map();
    for (let i = 0; i < buffer.length; i += 1) {
        const value = buffer[i];
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    let entropy = 0;
    for (const count of counts.values()) {
        const probability = count / buffer.length;
        entropy -= probability * Math.log2(probability);
    }
    return Math.round(entropy * 10000) / 10000;
}
function extractStrings(buffer, minLength = 4) {
    const output = [];
    let current = '';
    for (let i = 0; i < buffer.length; i += 1) {
        const byte = buffer[i];
        if (byte >= 32 && byte <= 126) {
            current += String.fromCharCode(byte);
            continue;
        }
        if (current.length >= minLength) {
            output.push(current);
        }
        current = '';
    }
    if (current.length >= minLength) {
        output.push(current);
    }
    return output;
}
//# sourceMappingURL=crypto.js.map