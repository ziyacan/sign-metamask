import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";

function App() {
    const [logged, setLogged] = useState(false);
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState();
    const forwarderOrigin = "http://localhost:3000";
    const onboarding = new MetaMaskOnboarding({ forwarderOrigin });
    const [provider, setProvider] = useState("");
    const [mess, setMessage] = useState();
    const [signature, setSignature] = useState();
    const [address, setAddress] = useState("");
    const [verifyAddress, setVerifyAddress] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("");

    useEffect(() => {
        if (localStorage.getItem("account")) {
            setLogged(true);
            setAccount(localStorage.getItem("account"));
            setProvider(new ethers.providers.Web3Provider(window.ethereum));
        }
    }, []);
    const copyButton = () => {
        navigator.clipboard.writeText(signature);
        alert("Copied");
    };
    const parseAddress = (_address) => {
        return _address.slice(0, 4) + "..." + _address.slice(-4);
    };
    const handleLogin = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log("MetaMask Here!");
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((result) => {
                    console.log(result);
                    setLogged(true);
                    const account = ethers.utils.getAddress(result[0]);
                    localStorage.setItem("account", account);
                    setAccount(account);
                    setProvider(
                        new ethers.providers.Web3Provider(window.ethereum)
                    );
                })
                .catch((error) => {
                    console.log("Could not detect Account");
                });
        } else {
            console.log("Need to install MetaMask");
            onboarding.startOnboarding();
        }
    };
    const handleLogout = () => {
        setLogged(false);
        setAccount(null);
    };
    const handleBalance = () => {
        window.ethereum
            .request({ method: "eth_getBalance", params: [account, "latest"] })
            .then((balance) => {
                setBalance(ethers.utils.formatEther(balance));
            })
            .catch((error) => {
                console.log("Could not detect the Balance");
            });
    };
    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    const handleSign = async () => {
        const message = mess;
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();
        setSignature(signature);
        setAddress(address);
        console.log("sig : " + signature);
    };
    const verify = () => {
        const actualAddress = ethers.utils.verifyMessage(mess, signature);
        console.log(actualAddress);
        setVerifyAddress(actualAddress);
        if (actualAddress !== address) {
            console.log("invalid");
            setVerificationStatus("False");
        } else {
            console.log("valid");
            setVerificationStatus("True");
        }
    };

    return (
        <div>
            {!logged ? (
                <div className="App">
                    <h1>Log in with Metamask wallet</h1>
                    <button onClick={handleLogin}>Connect</button>
                </div>
            ) : (
                <div className="App">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <h2>Logged from {parseAddress(account)}</h2>
                        <button onClick={handleLogout}>Disconnect</button>
                    </div>
                    <br></br>
                    <br></br>
                    <button onClick={handleBalance}>check Balance</button>
                    <h2>Balance is {balance}</h2>
                    <input
                        type="text"
                        placeholder="message"
                        onChange={(e) => handleChange(e)}
                    />
                    <button onClick={() => handleSign()}>Sign</button>
                    {address && (
                        <div>
                            <p>
                                <font size="5" color="red">
                                    Message is : <br></br>
                                    {mess}
                                </font>
                            </p>
                            <p>
                                <font size="5">
                                    signature is : <br></br>
                                    {parseAddress(signature)}
                                </font>
                            </p>
                            <button onClick={copyButton}>Copy Signature</button>
                            <p>
                                <font size="5" color="green">
                                    address is : <br></br>
                                    {address}
                                </font>
                            </p>
                        </div>
                    )}
                    {address && (
                        <div>
                            <br></br>
                            <button onClick={verify}>Verify</button>
                            <p>
                                <font size="5" color="purple">
                                    verification : <br></br>
                                    {verificationStatus}
                                </font>
                            </p>
                            <p>
                                <font size="5" color="blue">
                                    verification address is : <br></br>
                                    {verifyAddress}
                                </font>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
export default App;
