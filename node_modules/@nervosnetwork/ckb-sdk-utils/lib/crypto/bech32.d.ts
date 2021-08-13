export declare const encode: (prefix: string, words: Uint8Array) => string;
export declare const decode: (encoded: string) => {
    prefix: string;
    words: number[];
};
export declare const toWords: (bytes: Uint8Array) => Uint8Array;
export declare const fromWords: (words: Uint8Array) => Uint8Array;
declare const _default: {
    decode: (encoded: string) => {
        prefix: string;
        words: number[];
    };
    encode: (prefix: string, words: Uint8Array) => string;
    toWords: (bytes: Uint8Array) => Uint8Array;
    fromWords: (words: Uint8Array) => Uint8Array;
};
export default _default;
