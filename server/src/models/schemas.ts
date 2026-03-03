import { z } from 'zod';
import { IncidentStatus, Severity, UserRole } from '../types';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/[A-Z]/, 'Must include uppercase character')
    .regex(/[a-z]/, 'Must include lowercase character')
    .regex(/[0-9]/, 'Must include numeric character')
    .regex(/[^A-Za-z0-9]/, 'Must include special character'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ingestLogSchema = z.object({
  source: z.string().min(1).max(255),
  logType: z.string().min(1).max(100),
  severity: z.nativeEnum(Severity).default(Severity.INFO),
  message: z.string().min(1).max(10000),
  rawData: z.record(z.unknown()).default({}),
  sourceIp: z.string().ip().optional().nullable(),
  destinationIp: z.string().ip().optional().nullable(),
  eventTimestamp: z.string().datetime().optional(),
});

export const ingestLogBatchSchema = z.object({
  logs: z.array(ingestLogSchema).min(1).max(1000),
});

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().min(10).max(10000),
  severity: z.nativeEnum(Severity),
  source: z.string().min(1).max(255),
  assignedTo: z.string().uuid().nullable().optional(),
  mitreTactic: z.string().max(100).nullable().optional(),
  mitreTechnique: z.string().max(100).nullable().optional(),
  alertIds: z.array(z.string().uuid()).default([]),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().min(10).max(10000).optional(),
  severity: z.nativeEnum(Severity).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  mitreTactic: z.string().max(100).nullable().optional(),
  mitreTechnique: z.string().max(100).nullable().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const iocQuerySchema = z.object({
  iocType: z.enum(['ip', 'domain', 'hash', 'url', 'email']),
  iocValue: z.string().min(1).max(500),
});

export const createThreatIntelSchema = z.object({
  iocType: z.enum(['ip', 'domain', 'hash', 'url', 'email']),
  iocValue: z.string().min(1).max(500),
  threatType: z.string().min(1).max(255),
  confidence: z.number().min(0).max(100),
  source: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
});

export const jwtDecodeSchema = z.object({
  token: z.string().min(10),
});

export const headerCheckSchema = z.object({
  url: z.string().url(),
  headers: z.record(z.string()).default({}),
});

export const portScanSchema = z
  .object({
    target: z.string().min(1).max(255),
    ports: z.array(z.number().int().min(1).max(65535)).min(1).max(200).optional(),
    rangeStart: z.number().int().min(1).max(65535).optional(),
    rangeEnd: z.number().int().min(1).max(65535).optional(),
  })
  .refine(input => input.ports || (input.rangeStart && input.rangeEnd), {
    message: 'Either ports[] or rangeStart/rangeEnd must be provided',
  });

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const aiAnalysisSchema = z.object({
  type: z.enum([
    'incident_summary',
    'threat_classification',
    'malware_explanation',
    'remediation',
    'executive_report',
  ]),
  resourceId: z.string().uuid(),
  context: z.string().max(5000).optional(),
});
