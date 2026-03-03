"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobType = exports.SocketEvent = exports.AuditAction = exports.AnalysisStatus = exports.Severity = exports.IncidentStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SOC_ANALYST"] = "SOC_ANALYST";
    UserRole["MALWARE_ANALYST"] = "MALWARE_ANALYST";
    UserRole["PENTESTER"] = "PENTESTER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["OPEN"] = "OPEN";
    IncidentStatus["INVESTIGATING"] = "INVESTIGATING";
    IncidentStatus["ESCALATED"] = "ESCALATED";
    IncidentStatus["RESOLVED"] = "RESOLVED";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var Severity;
(function (Severity) {
    Severity["CRITICAL"] = "CRITICAL";
    Severity["HIGH"] = "HIGH";
    Severity["MEDIUM"] = "MEDIUM";
    Severity["LOW"] = "LOW";
    Severity["INFO"] = "INFO";
})(Severity || (exports.Severity = Severity = {}));
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "PENDING";
    AnalysisStatus["PROCESSING"] = "PROCESSING";
    AnalysisStatus["COMPLETED"] = "COMPLETED";
    AnalysisStatus["FAILED"] = "FAILED";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_REGISTER"] = "USER_REGISTER";
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["TOKEN_REFRESH"] = "TOKEN_REFRESH";
    AuditAction["INCIDENT_CREATE"] = "INCIDENT_CREATE";
    AuditAction["INCIDENT_UPDATE"] = "INCIDENT_UPDATE";
    AuditAction["ALERT_CREATE"] = "ALERT_CREATE";
    AuditAction["MALWARE_UPLOAD"] = "MALWARE_UPLOAD";
    AuditAction["MALWARE_ANALYSIS"] = "MALWARE_ANALYSIS";
    AuditAction["THREAT_INTEL_QUERY"] = "THREAT_INTEL_QUERY";
    AuditAction["PENTEST_SCAN"] = "PENTEST_SCAN";
    AuditAction["USER_MANAGEMENT"] = "USER_MANAGEMENT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var SocketEvent;
(function (SocketEvent) {
    SocketEvent["ALERT_NEW"] = "alert:new";
    SocketEvent["INCIDENT_CREATED"] = "incident:created";
    SocketEvent["INCIDENT_UPDATED"] = "incident:updated";
    SocketEvent["ANALYSIS_COMPLETE"] = "analysis:complete";
    SocketEvent["WORKER_STATUS"] = "worker:status";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
var JobType;
(function (JobType) {
    JobType["MALWARE_ANALYSIS"] = "malware_analysis";
    JobType["AI_SUMMARIZATION"] = "ai_summarization";
    JobType["THREAT_CLASSIFICATION"] = "threat_classification";
})(JobType || (exports.JobType = JobType = {}));
//# sourceMappingURL=index.js.map