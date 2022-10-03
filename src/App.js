import React, { useEffect, useState } from "react";
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";

function App() {
  //  ユーザーのウォレットアドレスを格納するために使用する状態変数を定義。
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  // 適切なネットワークにいるか確認。
  const [isNetworkOk, setIsNetworkOk] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ユーザーがGoerli NetWorkに接続しているか確認。
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== "5") {
        alert("Connect with Goerli Test Network");
        setIsNetworkOk(false);
      } else {
        console.log("Connected with Goerli Test Network");
        setIsNetworkOk(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Walletを持っているか確認。
  const checkIfWalletIsConnected = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        setIsLoading(false);
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // レンダリングメソッド
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    // シナリオ 1. ユーザーがログインしていな場合、”Connect Wallet"を表示。
    if (!currentAccount) {
      return (
        <div>
          <img src="https://i.imgur.com/TXBQ4cC.png" alt="LUFFY" />
          <button
            type="button"
            class="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium  leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    }

    // シナリオ 2. ユーザーはログインしているが、NFTキャラを持っていない場合、"Choose~"を表示。
    else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    }

    // シナリオ 3. ユーザーはログインしており、NFTキャラも持っている場合、"Area"で戦闘。
    else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  // connectWalletメソッドを実装。
  const connectWalletAction = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask");
        setIsLoading(false);
        return;
      }

      checkIfWalletIsConnected();

      const acounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", acounts[0]);
      setCurrentAccount(acounts[0]);
    } catch (error) {
      console.log(error);
    }

    checkNetwork();
    setIsLoading(false);
  };

  // 毎ロード時にWalletに接続されているか確認。
  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    setIsLoading(false);
  }, []);

  // 毎ロード時にユーザーがNFTを持っているか確認。
  useEffect(() => {
    setIsLoading(true);
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address...", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
    };

    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
    setIsLoading(false);
  }, [currentAccount]);

  return (
    <div className=" min-h-screen bg-blue-900 text-white flex flex-col justify-center items-center text-center">
      <p className="mt-10 text-3xl font-extrabold">⚡️ BlockChain Game ⚡️</p>
      <p className="text-xl m-10">
        Let's mint your One Piece character and fight with a Boss.✨
      </p>
      {renderContent()}
    </div>
  );
}

export default App;
