/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';
const CompiledContractArtifact = require(`./build/contracts/ERC20.json`);

// const { AddressTranslator } = require('nervos-godwoken-integration');
import { TrustWrapper } from '../lib/contracts/TrustWrapper';
import { CONFIG } from '../config';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

	try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-EPthereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<TrustWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [ckethBalance,setCkethBalance] = useState<number | undefined>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [withdrawTx, setWithdrawTx] = useState<string | undefined>();
    const [addKidTx, setAddKidTx] = useState<string | undefined>();
    const [withdrawnFunds, setWithdrawnFunds] = useState<number | undefined>();
    const [kid, setKid] = useState<string | undefined>();
    const [timeInFuture, setTimeInFuture] = useState<number | undefined>();
    const [donationAmount, setDonationAmount] = useState<number | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [l2DepositAddressOnL1, setL2DepositAddressOnL1] = useState<string | undefined>();
    const toastId = React.useRef(null);
    
  
 
    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
	    const poly = addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]);
            setPolyjuiceAddress(poly);
            addressTranslator.getLayer2DepositAddress(web3, account).then( (depositAddress) => {
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

        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];
    console.log(account);  

    
    async function deployContract() {
        const _contract = new TrustWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function withdrawFunds() {
        try {
            setTransactionInProgress(true);
            const tx = await contract.withdrawFunds(account);
	    setWithdrawTx(tx);
	    console.log(tx);
            toast('Successfully withdrawn funds', { type: 'success' });
        } catch (error) {
	    console.log(1);
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new TrustWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
    }

    async function addTheKid() {
        try {
            setTransactionInProgress(true);
	    //const amountx = web3.utils.toWei(donationAmount.toString(),'shannon');
	    const amountx = donationAmount * 10**8;
	    console.log(amountx);        
	    const tx = await contract.addTheKid(amountx, kid, timeInFuture, account);
	    setAddKidTx(tx);
	    console.log(tx);
            toast(
                'Successfully added the kid.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });


            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();

    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
	    Your L2 Deposit Address on L1: <b>{l2DepositAddressOnL1 || ' - '}</b>
            <br />
            <br />
            Click for Support to Ethereum Assets through Force Bridge <a href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000">https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000</a>
            <br />
	    <b>IMPORTANT ❗</b>Receiver Address should be Your L2 Deposit Address on L1 generated above.
            <br />
            <br />
            Nervos CkEth Layer 2 balance:{' '}
            <b>{ckethBalance ? (ckethBalance / 10 ** 18).toString() : <LoadingIndicator />} ckETH</b>
            <br />
            <br />

            Nervos CKB Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            Deploy transaction hash: <b>{deployTxHash || '-'}</b>
            <br />
            <hr />
            <p>
               	Donate some funds in the future to some address of your choice.
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={withdrawFunds} disabled={!contract}>
                withdraw funds
            </button>
            
            {withdrawTx ? <>&nbsp;&nbsp;Success : {withdrawTx.toString()}</> : null}
            <br />
            <br />
            <input
                type="number"
                placeholder="time in future in seconds"
                onChange={e => setTimeInFuture(parseInt(e.target.value,10))}
            />
            <input
                type="string"
                placeholder="kid address"
                onChange={e => setKid(e.target.value)}
            />
            <input
                type="number"
                placeholder="donation amount"
                onChange={e => setDonationAmount(parseInt(e.target.value,10))}
            />
            <button onClick={addTheKid} disabled={!contract}>
                Add the kid.
            </button>
            {addKidTx ? <>&nbsp;&nbsp;Success : {addKidTx}</> : null}
            <br />
            <br />
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
        </div>
    );
}
