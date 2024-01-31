"use strict";

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;
// const web3 = new Web3(rpc_url);

// Web3modal instance
let web3Modal;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

/**
 * Setup the orchestra
 */
function init() {
    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    if (location.protocol !== "https:") {
        // https://ethereum.stackexchange.com/a/62217/620
        const alert = document.querySelector("#alert-error-https");
        alert.style.display = "block";
        document.querySelector("#btn-connect").setAttribute("disabled", "disabled");
        return;
    }

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                // Mikko's test key - don't copy as your mileage may vary
                // infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
                rpc: {
                    7700: rpc_url,
                },
            },
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}
/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
    // Get a Web3 instance for the wallet

    let web3 = new Web3(provider);
    //   console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();

    // Load chain information over an HTTP API
    //   const chainData = evmChains.getChain(chainId);
    //   document.querySelector("#network-name").textContent = chainData.name;

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    //   console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    document.querySelector("#selected-account").textContent = selectedAccount;

    // Get a handl
    const template = document.querySelector("#template-balance");
    const accountContainer = document.querySelector("#accounts");

    // Purge UI elements any previously loaded accounts
    accountContainer.innerHTML = "";

    // Go through all accounts and get their ETH balance
    // const rowResolvers = accounts.map(async (address) => {
    //     const balance = await web3.eth.getBalance(address);
    //     // ethBalance is a BigNumber instance
    //     // https://github.com/indutny/bn.js/
    //     const ethBalance = web3.utils.fromWei(balance, "ether");
    //     const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    //     // Fill in the templated row and put in the document
    //     const clone = template.content.cloneNode(true);
    //     clone.querySelector(".address").textContent = address;
    //     clone.querySelector(".balance").textContent = humanFriendlyBalance;
    //     accountContainer.appendChild(clone);
    // });

    // Because rendering account does its own RPC commucation
    // with Ethereum node, we do not want to display any results
    // until data for all accounts is loaded
    // await Promise.all(rowResolvers);

    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";

    return selectedAccount;
}
/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#prepare").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled");
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled");
}
/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}
/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
    console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if (provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    selectedAccount = null;

    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";
}
/**
 * Main entry point.
 */

async function getchainId() {
    let WEB3 = new Web3(provider || rpc_url);
    const chainId = await WEB3.eth.getChainId();
    return chainId;
}

async function mintNft() {
    let chainid = await getchainId();
    if (chainid != network_id) {
        toastr.error("Connect to Canto Network!");
        return false;
    }
    let web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
    let balance = await web3.eth.getBalance(selectedAccount);
    balance = balance / Math.pow(10, ethereum_decimal);
    console.log(balance);
    let nft_contract = new web3.eth.Contract(nft_abi, nft_address);
    let priceWei = await nft_contract.methods.MintPrice().call();
    console.log(priceWei);
    let minted = await nft_contract.methods.totalSupply().call();
    console.log(minted);
    let walletMint = await nft_contract.methods.WalletMint(selectedAccount).call();
    console.log(walletMint);
    let free = await nft_contract.methods.freeMint().call();
    console.log(free);
    let amount = parseInt($("#quantity").val());
    console.log(amount);

    if (walletMint < free) {
        if (amount <= free - walletMint) {
            amount = free;
        }
        const cost = priceWei * amount - free;
        console.log(cost);
        await nft_contract.methods.mint(amount).send({ from: selectedAccount, value: cost }, function (error, result) {
            if (result) {
                var interval = setInterval(async function () {
                    var receipt = await web3.eth.getTransactionReceipt(result);
                    if (receipt != null) {
                        clearInterval(interval);
                        if (receipt.status == true) {
                            toastr.success("NFT Minted in the Blockchain!");
                        } else if (receipt.status == false) {
                            toastr.error("NFT Minting failed in the Blockchain!");
                        } else {
                            toastr.error("NFT Minting failed in the Blockchain!");
                        }
                    }
                }, 5000);
            }
        });
    } else {
        const cost = priceWei * amount;
        console.log(cost);
        await nft_contract.methods.mint(amount).send({ from: selectedAccount, value: cost }, function (error, result) {
            if (result) {
                var interval = setInterval(async function () {
                    var receipt = await web3.eth.getTransactionReceipt(result);
                    if (receipt != null) {
                        clearInterval(interval);
                        if (receipt.status == true) {
                            toastr.success("NFT Minted in the Blockchain!");
                        } else if (receipt.status == false) {
                            toastr.error("NFT Minting failed in the Blockchain!");
                        } else {
                            toastr.error("NFT Minting failed in the Blockchain!");
                        }
                    }
                }, 5000);
            }
        });
    }
}

window.addEventListener("load", async () => {
    init();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
    document.querySelector("#mint-nft").addEventListener("click", mintNft);
});