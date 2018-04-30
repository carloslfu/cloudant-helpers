export declare const createDBs: (cloudant: any, dbNames: any) => Promise<void>;
export declare const destroyDBs: (cloudant: any) => Promise<void>;
export declare const stressCloudant: (cloudant: any, dbName: any, type: any, num: any) => Promise<void>;
export declare const cdt: (inst: any, name: string, ...data: any[]) => Promise<any>;
