import { HashType, CKBModel } from '../interfaces';
import { Address, AddressPrefix } from './address';
export declare class Script implements CKBModel {
    codeHash: string;
    args: string;
    hashType: HashType;
    static fromRPC(data: any): Script | undefined;
    constructor(codeHash: string, args: string, hashType: HashType);
    sameWith(script: Script): boolean;
    validate(): boolean;
    serializeJson(): object;
    toHash(): string;
    toAddress(prefix?: AddressPrefix): Address;
}
