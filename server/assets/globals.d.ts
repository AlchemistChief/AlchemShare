// global.d.ts
export {};

declare global {
    var HttpError: typeof import('./errorClass.ts').HttpError;
}
