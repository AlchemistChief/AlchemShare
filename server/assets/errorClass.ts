// assets/errorClass.ts
export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'HttpError';

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}

// Assign to globalThis
globalThis.HttpError = HttpError;