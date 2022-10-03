import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import myEpicGame from "../utils/MyEpicGame.json";
import LoadingIndicator from "./LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  // NFTキャラクターをミントする。
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
        setMintingCharacter(false);
      }
    } catch (error) {
      console.log("MintCharacterAction Error", error);
      setMintingCharacter(false);
    }
  };

  // ページリロード時に以下実行。すぐにContractを呼び出す。
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  // データをスマートコントラクトから取得。
  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");
        const charactersTxn = await gameContract.getAllDefaultCharacters();

        console.log("charactersTxn: ", charactersTxn);

        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch (error) {
        console.log("Something went wrong fetching characters:", error);
      }
    };

    // イベント受信時のコールバック
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );
      // NFTがMintされたらコントラクトからメタデータを受け取る。
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log("CharacterNFT:", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
        alert(
          `NFT character has been minted -- the link is following: https://testnets.opensea.io/assets/goerli/${
            gameContract.address
          }/${tokenId.toNumber()}`
        );
      }
    };

    if (gameContract) {
      getCharacters();
      // NFTキャラクターがミントされた通知を受け取る。
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      // コンポーネントがマウントされたら、リスナーを停止。
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract]);

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div
        className=" items-center flex flex-col p-5 m-10 bg-blue-400 rounded-3xl"
        key={character.name}
      >
        <p className=" bg-gray-500 px-10 py-1 rounded-lg text-3xl font-bold ">
          {character.name}
        </p>
        <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
        <button
          type="button"
          class="inline-block px-6 py-2.5 bg-yellow-400 text-white font-extrabold  leading-tight uppercase rounded shadow-md hover:bg-yellow-500 hover:shadow-lg focus:bg-yellow-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-yellow-700 active:shadow-lg transition duration-150 ease-in-out text-2xl"
          onClick={mintCharacterNFTAction(index)}
        >
          {`Mint ${character.name}`}
        </button>
      </div>
    ));

  return (
    <div>
      <h2 className="underline">Choose Your Character</h2>
      {mintingCharacter && (
        <div flex flex-col m-3>
          <LoadingIndicator />
          <p className="animate-pulse">Minting in Progress...</p>
        </div>
      )}
      {characters.length > 0 && (
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 2xl::grid-cols-4 overflow-y-scroll max-h-[60vh]">
          {renderCharacters()}
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
