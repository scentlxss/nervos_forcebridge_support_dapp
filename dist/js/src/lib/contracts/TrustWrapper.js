"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustWrapper = void 0;
const TrustJSON = __importStar(require("../../../build/contracts/Trust.json"));
const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};
class TrustWrapper {
    constructor(web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(TrustJSON.abi);
    }
    get isDeployed() {
        return Boolean(this.address);
    }
    async withdrawFunds(fromAddress) {
        const tx = await this.contract.methods.withdraw().send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });
        return tx.transactionHash;
    }
    async addTheKid(value, kid, timeInFuture, fromAddress) {
        const tx = await this.contract.methods.addKid(kid, timeInFuture).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value
        });
        return tx.transactionHash;
    }
    async deploy(fromAddress) {
        const deployTx = await this.contract
            .deploy({
            data: TrustJSON.bytecode,
            arguments: []
        })
            .send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            to: '0x0000000000000000000000000000000000000000'
        });
        this.useDeployed(deployTx.contractAddress);
        return deployTx.transactionHash;
    }
    useDeployed(contractAddress) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
exports.TrustWrapper = TrustWrapper;
//# sourceMappingURL=TrustWrapper.js.map