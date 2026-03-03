import { z } from 'zod';
import { IncidentStatus, Severity, UserRole } from '../types';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    username: string;
}, {
    password: string;
    email: string;
    username: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ingestLogSchema: z.ZodObject<{
    source: z.ZodString;
    logType: z.ZodString;
    severity: z.ZodDefault<z.ZodNativeEnum<typeof Severity>>;
    message: z.ZodString;
    rawData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    sourceIp: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    destinationIp: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    eventTimestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    source: string;
    logType: string;
    severity: Severity;
    rawData: Record<string, unknown>;
    sourceIp?: string | null | undefined;
    destinationIp?: string | null | undefined;
    eventTimestamp?: string | undefined;
}, {
    message: string;
    source: string;
    logType: string;
    severity?: Severity | undefined;
    rawData?: Record<string, unknown> | undefined;
    sourceIp?: string | null | undefined;
    destinationIp?: string | null | undefined;
    eventTimestamp?: string | undefined;
}>;
export declare const ingestLogBatchSchema: z.ZodObject<{
    logs: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        logType: z.ZodString;
        severity: z.ZodDefault<z.ZodNativeEnum<typeof Severity>>;
        message: z.ZodString;
        rawData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sourceIp: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        destinationIp: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        eventTimestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        source: string;
        logType: string;
        severity: Severity;
        rawData: Record<string, unknown>;
        sourceIp?: string | null | undefined;
        destinationIp?: string | null | undefined;
        eventTimestamp?: string | undefined;
    }, {
        message: string;
        source: string;
        logType: string;
        severity?: Severity | undefined;
        rawData?: Record<string, unknown> | undefined;
        sourceIp?: string | null | undefined;
        destinationIp?: string | null | undefined;
        eventTimestamp?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    logs: {
        message: string;
        source: string;
        logType: string;
        severity: Severity;
        rawData: Record<string, unknown>;
        sourceIp?: string | null | undefined;
        destinationIp?: string | null | undefined;
        eventTimestamp?: string | undefined;
    }[];
}, {
    logs: {
        message: string;
        source: string;
        logType: string;
        severity?: Severity | undefined;
        rawData?: Record<string, unknown> | undefined;
        sourceIp?: string | null | undefined;
        destinationIp?: string | null | undefined;
        eventTimestamp?: string | undefined;
    }[];
}>;
export declare const createIncidentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    severity: z.ZodNativeEnum<typeof Severity>;
    source: z.ZodString;
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mitreTactic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mitreTechnique: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    alertIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    source: string;
    severity: Severity;
    title: string;
    description: string;
    alertIds: string[];
    assignedTo?: string | null | undefined;
    mitreTactic?: string | null | undefined;
    mitreTechnique?: string | null | undefined;
}, {
    source: string;
    severity: Severity;
    title: string;
    description: string;
    assignedTo?: string | null | undefined;
    mitreTactic?: string | null | undefined;
    mitreTechnique?: string | null | undefined;
    alertIds?: string[] | undefined;
}>;
export declare const updateIncidentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodNativeEnum<typeof Severity>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof IncidentStatus>>;
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mitreTactic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mitreTechnique: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: IncidentStatus | undefined;
    severity?: Severity | undefined;
    title?: string | undefined;
    description?: string | undefined;
    assignedTo?: string | null | undefined;
    mitreTactic?: string | null | undefined;
    mitreTechnique?: string | null | undefined;
}, {
    status?: IncidentStatus | undefined;
    severity?: Severity | undefined;
    title?: string | undefined;
    description?: string | undefined;
    assignedTo?: string | null | undefined;
    mitreTactic?: string | null | undefined;
    mitreTechnique?: string | null | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const iocQuerySchema: z.ZodObject<{
    iocType: z.ZodEnum<["ip", "domain", "hash", "url", "email"]>;
    iocValue: z.ZodString;
}, "strip", z.ZodTypeAny, {
    iocType: "email" | "ip" | "domain" | "hash" | "url";
    iocValue: string;
}, {
    iocType: "email" | "ip" | "domain" | "hash" | "url";
    iocValue: string;
}>;
export declare const createThreatIntelSchema: z.ZodObject<{
    iocType: z.ZodEnum<["ip", "domain", "hash", "url", "email"]>;
    iocValue: z.ZodString;
    threatType: z.ZodString;
    confidence: z.ZodNumber;
    source: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    iocType: "email" | "ip" | "domain" | "hash" | "url";
    iocValue: string;
    threatType: string;
    confidence: number;
}, {
    source: string;
    description: string;
    iocType: "email" | "ip" | "domain" | "hash" | "url";
    iocValue: string;
    threatType: string;
    confidence: number;
}>;
export declare const jwtDecodeSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const headerCheckSchema: z.ZodObject<{
    url: z.ZodString;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    headers: Record<string, string>;
    url: string;
}, {
    url: string;
    headers?: Record<string, string> | undefined;
}>;
export declare const portScanSchema: z.ZodEffects<z.ZodObject<{
    target: z.ZodString;
    ports: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    rangeStart: z.ZodOptional<z.ZodNumber>;
    rangeEnd: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    target: string;
    ports?: number[] | undefined;
    rangeStart?: number | undefined;
    rangeEnd?: number | undefined;
}, {
    target: string;
    ports?: number[] | undefined;
    rangeStart?: number | undefined;
    rangeEnd?: number | undefined;
}>, {
    target: string;
    ports?: number[] | undefined;
    rangeStart?: number | undefined;
    rangeEnd?: number | undefined;
}, {
    target: string;
    ports?: number[] | undefined;
    rangeStart?: number | undefined;
    rangeEnd?: number | undefined;
}>;
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
}, {
    role: UserRole;
}>;
export declare const updateUserStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
}, {
    isActive: boolean;
}>;
export declare const aiAnalysisSchema: z.ZodObject<{
    type: z.ZodEnum<["incident_summary", "threat_classification", "malware_explanation", "remediation", "executive_report"]>;
    resourceId: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "threat_classification" | "incident_summary" | "malware_explanation" | "remediation" | "executive_report";
    resourceId: string;
    context?: string | undefined;
}, {
    type: "threat_classification" | "incident_summary" | "malware_explanation" | "remediation" | "executive_report";
    resourceId: string;
    context?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map