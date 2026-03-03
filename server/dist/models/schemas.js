"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiAnalysisSchema = exports.updateUserStatusSchema = exports.updateUserRoleSchema = exports.portScanSchema = exports.headerCheckSchema = exports.jwtDecodeSchema = exports.createThreatIntelSchema = exports.iocQuerySchema = exports.paginationSchema = exports.updateIncidentSchema = exports.createIncidentSchema = exports.ingestLogBatchSchema = exports.ingestLogSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    username: zod_1.z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    password: zod_1.z
        .string()
        .min(12)
        .max(128)
        .regex(/[A-Z]/, 'Must include uppercase character')
        .regex(/[a-z]/, 'Must include lowercase character')
        .regex(/[0-9]/, 'Must include numeric character')
        .regex(/[^A-Za-z0-9]/, 'Must include special character'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.ingestLogSchema = zod_1.z.object({
    source: zod_1.z.string().min(1).max(255),
    logType: zod_1.z.string().min(1).max(100),
    severity: zod_1.z.nativeEnum(types_1.Severity).default(types_1.Severity.INFO),
    message: zod_1.z.string().min(1).max(10000),
    rawData: zod_1.z.record(zod_1.z.unknown()).default({}),
    sourceIp: zod_1.z.string().ip().optional().nullable(),
    destinationIp: zod_1.z.string().ip().optional().nullable(),
    eventTimestamp: zod_1.z.string().datetime().optional(),
});
exports.ingestLogBatchSchema = zod_1.z.object({
    logs: zod_1.z.array(exports.ingestLogSchema).min(1).max(1000),
});
exports.createIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(500),
    description: zod_1.z.string().min(10).max(10000),
    severity: zod_1.z.nativeEnum(types_1.Severity),
    source: zod_1.z.string().min(1).max(255),
    assignedTo: zod_1.z.string().uuid().nullable().optional(),
    mitreTactic: zod_1.z.string().max(100).nullable().optional(),
    mitreTechnique: zod_1.z.string().max(100).nullable().optional(),
    alertIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
});
exports.updateIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(500).optional(),
    description: zod_1.z.string().min(10).max(10000).optional(),
    severity: zod_1.z.nativeEnum(types_1.Severity).optional(),
    status: zod_1.z.nativeEnum(types_1.IncidentStatus).optional(),
    assignedTo: zod_1.z.string().uuid().nullable().optional(),
    mitreTactic: zod_1.z.string().max(100).nullable().optional(),
    mitreTechnique: zod_1.z.string().max(100).nullable().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.iocQuerySchema = zod_1.z.object({
    iocType: zod_1.z.enum(['ip', 'domain', 'hash', 'url', 'email']),
    iocValue: zod_1.z.string().min(1).max(500),
});
exports.createThreatIntelSchema = zod_1.z.object({
    iocType: zod_1.z.enum(['ip', 'domain', 'hash', 'url', 'email']),
    iocValue: zod_1.z.string().min(1).max(500),
    threatType: zod_1.z.string().min(1).max(255),
    confidence: zod_1.z.number().min(0).max(100),
    source: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().min(1).max(5000),
});
exports.jwtDecodeSchema = zod_1.z.object({
    token: zod_1.z.string().min(10),
});
exports.headerCheckSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    headers: zod_1.z.record(zod_1.z.string()).default({}),
});
exports.portScanSchema = zod_1.z
    .object({
    target: zod_1.z.string().min(1).max(255),
    ports: zod_1.z.array(zod_1.z.number().int().min(1).max(65535)).min(1).max(200).optional(),
    rangeStart: zod_1.z.number().int().min(1).max(65535).optional(),
    rangeEnd: zod_1.z.number().int().min(1).max(65535).optional(),
})
    .refine(input => input.ports || (input.rangeStart && input.rangeEnd), {
    message: 'Either ports[] or rangeStart/rangeEnd must be provided',
});
exports.updateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(types_1.UserRole),
});
exports.updateUserStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.aiAnalysisSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'incident_summary',
        'threat_classification',
        'malware_explanation',
        'remediation',
        'executive_report',
    ]),
    resourceId: zod_1.z.string().uuid(),
    context: zod_1.z.string().max(5000).optional(),
});
//# sourceMappingURL=schemas.js.map