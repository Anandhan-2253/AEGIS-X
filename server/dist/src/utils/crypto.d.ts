export declare function hashString(value: string): string;
export declare function generateSecureToken(bytes?: number): string;
export declare function computeFileMD5(filePath: string): Promise<string>;
export declare function computeFileSHA256(filePath: string): Promise<string>;
export declare function calculateEntropy(buffer: Buffer): number;
export declare function extractStrings(buffer: Buffer, minLength?: number): string[];
//# sourceMappingURL=crypto.d.ts.map