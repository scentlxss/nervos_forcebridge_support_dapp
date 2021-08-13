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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __importStar(require("react"));
const web3_1 = __importDefault(require("web3"));
const react_toastify_1 = require("react-toastify");
require("./app.scss");
require("react-toastify/dist/ReactToastify.css");
const web3_2 = require("@polyjuice-provider/web3");
const nervos_godwoken_integration_1 = require("nervos-godwoken-integration");
const CompiledContractArtifact = require(`./build/contracts/ERC20.json`);
// const { AddressTranslator } = require('nervos-godwoken-integration');
const TrustWrapper_1 = require("../lib/contracts/TrustWrapper");
const config_1 = require("../config");
async function createWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        const godwokenRpcUrl = config_1.CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: config_1.CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: config_1.CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };
        const provider = new web3_2.PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new web3_1.default(provider || web3_1.default.givenProvider);
        try {
            // Request account access if needed
            await window.ethereum.enable();
        }
        catch (error) {
            // User denied account access...
        }
        return web3;
    }
    console.log('Non-EPthereum browser detected. You should consider trying MetaMask!');
    return null;
}
function App() {
    const [web3, setWeb3] = react_1.useState(null);
    const [contract, setContract] = react_1.useState();
    const [accounts, setAccounts] = react_1.useState();
    const [l2Balance, setL2Balance] = react_1.useState();
    const [ckethBalance, setCkethBalance] = react_1.useState();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = react_1.useState();
    const [withdrawTx, setWithdrawTx] = react_1.useState();
    const [addKidTx, setAddKidTx] = react_1.useState();
    const [withdrawnFunds, setWithdrawnFunds] = react_1.useState();
    const [kid, setKid] = react_1.useState();
    const [timeInFuture, setTimeInFuture] = react_1.useState();
    const [donationAmount, setDonationAmount] = react_1.useState();
    const [deployTxHash, setDeployTxHash] = react_1.useState();
    const [polyjuiceAddress, setPolyjuiceAddress] = react_1.useState();
    const [transactionInProgress, setTransactionInProgress] = react_1.useState(false);
    const [l2DepositAddressOnL1, setL2DepositAddressOnL1] = react_1.useState();
    const toastId = react_1.default.useRef(null);
    react_1.useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new nervos_godwoken_integration_1.AddressTranslator();
            const poly = addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]);
            setPolyjuiceAddress(poly);
            addressTranslator.getLayer2DepositAddress(web3, account).then((depositAddress) => {
                setL2DepositAddressOnL1(depositAddress.addressString);
                console.log(`Layer 2 Deposit Address on Layer 1: \n${depositAddress.addressString}`);
            });
            setInterval(async () => {
                console.log(poly);
                console.log(account);
                const contract_erc20_proxy = new web3.eth.Contract(CompiledContractArtifact.abi, "0x6A16a5C353e13b2b66FFB38087Fe796c38A1CBE5");
                const data = await contract_erc20_proxy.methods.balanceOf(poly).call({
                    from: account
                });
                console.log(`L2 balance of ckETH: ${data}`);
                setCkethBalance(data);
            }, 6000);
        }
        else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);
    react_1.useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = react_toastify_1.toast.info('Transaction in progress. Confirm MetaMask signing dialog and please wait...', {
                position: 'top-right',
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                closeButton: false
            });
        }
        else if (!transactionInProgress && toastId.current) {
            react_toastify_1.toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);
    const account = accounts?.[0];
    console.log(account);
    async function deployContract() {
        const _contract = new TrustWrapper_1.TrustWrapper(web3);
        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);
            const transactionHash = await _contract.deploy(account);
            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            react_toastify_1.toast('Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    async function withdrawFunds() {
        try {
            setTransactionInProgress(true);
            const tx = await contract.withdrawFunds(account);
            setWithdrawTx(tx);
            console.log(tx);
            react_toastify_1.toast('Successfully withdrawn funds', { type: 'success' });
        }
        catch (error) {
            console.log(1);
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    async function setExistingContractAddress(contractAddress) {
        const _contract = new TrustWrapper_1.TrustWrapper(web3);
        _contract.useDeployed(contractAddress.trim());
        setContract(_contract);
    }
    async function addTheKid() {
        try {
            setTransactionInProgress(true);
            //const amountx = web3.utils.toWei(donationAmount.toString(),'shannon');
            const amountx = donationAmount * 10 ** 8;
            console.log(amountx);
            const tx = await contract.addTheKid(amountx, kid, timeInFuture, account);
            setAddKidTx(tx);
            console.log(tx);
            react_toastify_1.toast('Successfully added the kid.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    react_1.useEffect(() => {
        if (web3) {
            return;
        }
        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);
            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });
    const LoadingIndicator = () => react_1.default.createElement("span", { className: "rotating-icon" }, "\u2699\uFE0F");
    return (react_1.default.createElement("div", null,
        "Your ETH address: ",
        react_1.default.createElement("b", null, accounts?.[0]),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Your Polyjuice address: ",
        react_1.default.createElement("b", null, polyjuiceAddress || ' - '),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Your L2 Deposit Address on L1: ",
        react_1.default.createElement("b", null, l2DepositAddressOnL1 || ' - '),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Click for Support to Ethereum Assets through Force Bridge ",
        react_1.default.createElement("a", { href: "https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000" }, "https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("b", null, "IMPORTANT \u2757"),
        "Receiver Address should be Your L2 Deposit Address on L1 generated above.",
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Nervos CkEth Layer 2 balance:",
        ' ',
        react_1.default.createElement("b", null,
            ckethBalance ? (ckethBalance / 10 ** 18).toString() : react_1.default.createElement(LoadingIndicator, null),
            " ckETH"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Nervos CKB Layer 2 balance:",
        ' ',
        react_1.default.createElement("b", null,
            l2Balance ? (l2Balance / 10n ** 8n).toString() : react_1.default.createElement(LoadingIndicator, null),
            " CKB"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Deployed contract address: ",
        react_1.default.createElement("b", null, contract?.address || '-'),
        " ",
        react_1.default.createElement("br", null),
        "Deploy transaction hash: ",
        react_1.default.createElement("b", null, deployTxHash || '-'),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        react_1.default.createElement("p", null, "Donate some funds in the future to some address of your choice."),
        react_1.default.createElement("button", { onClick: deployContract, disabled: !l2Balance }, "Deploy contract"),
        "\u00A0or\u00A0",
        react_1.default.createElement("input", { placeholder: "Existing contract id", onChange: e => setExistingContractIdInputValue(e.target.value) }),
        react_1.default.createElement("button", { disabled: !existingContractIdInputValue || !l2Balance, onClick: () => setExistingContractAddress(existingContractIdInputValue) }, "Use existing contract"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("button", { onClick: withdrawFunds, disabled: !contract }, "withdraw funds"),
        withdrawTx ? react_1.default.createElement(react_1.default.Fragment, null,
            "\u00A0\u00A0Success : ",
            withdrawTx.toString()) : null,
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("input", { type: "number", placeholder: "time in future in seconds", onChange: e => setTimeInFuture(parseInt(e.target.value, 10)) }),
        react_1.default.createElement("input", { type: "string", placeholder: "kid address", onChange: e => setKid(e.target.value) }),
        react_1.default.createElement("input", { type: "number", placeholder: "donation amount", onChange: e => setDonationAmount(parseInt(e.target.value, 10)) }),
        react_1.default.createElement("button", { onClick: addTheKid, disabled: !contract }, "Add the kid."),
        addKidTx ? react_1.default.createElement(react_1.default.Fragment, null,
            "\u00A0\u00A0Success : ",
            addKidTx) : null,
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        "The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each transaction you might need to wait up to 120 seconds for the status to be reflected.",
        react_1.default.createElement(react_toastify_1.ToastContainer, null)));
}
exports.App = App;
//# sourceMappingURL=app.js.map