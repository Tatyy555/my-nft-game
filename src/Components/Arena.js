import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import myEpicGame from "../utils/MyEpicGame";
import "./Arena.css";
import LoadingIndicator from "./LoadingIndicator";

// フロントエンドに NFTキャラクターを表示するため、NFTデータを渡す。
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // コントラクトデータの変数初期化。
  const [gameContract, setGameContract] = useState(null);
  // ボスのメタデータの初期化。
  const [boss, setBoss] = useState(null);
  // 攻撃状態の保存する変数の初期化。
  const [attackState, setAttackState] = useState("");
  // 攻撃ダメージの表示形式を保存する変数を初期化します。
  const [showToast1, setShowToast1] = useState(false);
  // 回復状態の保存する変数の初期化。
  const [recoverState, setRecoverState] = useState("");
  // 回復ダメージの表示形式を保存する変数を初期化します。
  const [showToast2, setShowToast2] = useState(false);
  // GameOver。
  const [gameover, setGameOver] = useState(false);
  // YonWin
  const [youWin, setYouWin] = useState(false);


  // NFTがボスを攻撃する際に使用する関数。
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss");

        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);

        setAttackState("hit");

        setShowToast1(true);
        setTimeout(() => {
          setShowToast1(false);
        }, 5000);
      }
    } catch (error) {
      console.log("Error attacking boss:", error);
      setAttackState("");
    }
  };

  // NFTが回復する際に使用する関数。
  const runRecoverAction = async () => {
    try {
      if (gameContract) {
        setRecoverState("recovering");
        console.log("Recovering NFT");

        const recoverTxn = await gameContract.recoverPlayer();
        await recoverTxn.wait();
        console.log("recoverTxn:", recoverTxn);

        setRecoverState("hit");

        setShowToast2(true);
        setTimeout(() => {
          setShowToast2(false);
        }, 5000);
      }
    } catch (error) {
      console.log("Error recovering NFT:", error);
      setRecoverState("");
    }
  };

  // ボスデータの取得。
  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss: ", bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    // コールバックメソッドを追加。
    const onAttackOrRecoverComplete = (newBossHp, newPlayerHp) => {
      // ボスの新しいHP
      const bossHp = newBossHp.toNumber();
      // NFTの新しいHP
      const playerHp = newPlayerHp.toNumber();
      console.log(`AttackOrRecoverComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp };
      });

      if(bossHp === 0){
        setYouWin(true);
      }

      if(playerHp === 0){
        setGameOver(true);
      }


    };

    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackOrRecoverComplete", onAttackOrRecoverComplete);
    }
    return () => {
      if (gameContract) {
        gameContract.off("AttackOrRecoverComplete", onAttackOrRecoverComplete);
      }
    };
  }, [gameContract]);

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
  return (
    <div>
      {attackState === "attacking" && (
        <div flex flex-col m-3>
          <LoadingIndicator />
          <p className="animate-pulse text-red-500">Attacking in Progress...</p>
        </div>
      )}
      {showToast1 && (
        <p className="font-bold text-xl mb-5 animate-bounce">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</p>
      )}
      {recoverState === "recovering" && (
        <div flex flex-col m-3>
          <LoadingIndicator />
          <p className="animate-pulse text-green-500">
            Recovering in Progress...
          </p>
        </div>
      )}
      {showToast2 && (
        <p className="font-bold text-xl mb-5 animate-bounce">{`💥 ${characterNFT.name} has recovered to ${characterNFT.maxHp}!`}</p>
      )}
      {youWin && (
        <p className="font-bold text-5xl text-green-400 animate-bounce">You Win!!</p>
      )}
      {gameover && (
        <p className="font-bold text-5xl text-red-400 animate-bounce">You lose...</p>
      )}
      <div className="grid sm:grid-cols-2 space-x-0 sm:space-x-20">
        {boss && (
          <div className="flex flex-col justify-center items-center">
            <div
              className={`max-w-xs items-center flex flex-col p-5  bg-pink-300 rounded-3xl ${attackState}`}
            >
              <p className=" bg-gray-500 px-5 py-1 rounded-lg text-3xl font-bold ">
                🔥{boss.name}🔥
              </p>
              <img src={boss.imageURI} alt={boss.name} />
              <div className="flex flex-col items-center">
                <progress
                  className="h-8 w-72"
                  value={boss.hp}
                  max={boss.maxHp}
                />
                <p className="text-xl font-semibold absolute">{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
            <button
              type="button"
              class="mt-10 text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 rounded-lg text-xl font-extrabold px-5 py-2.5 text-center mr-2 mb-2"
              onClick={runAttackAction}
            >
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
        )}
        {characterNFT && (
          <div className="flex flex-col justify-center items-center my-10">
            <div
              className={`max-w-xs items-center flex flex-col p-5  bg-blue-400 rounded-3xl ${recoverState}`}
            >
              <p className=" bg-gray-500 px-5 py-1 rounded-lg text-3xl font-bold ">
                {`(Your) ${characterNFT.name}`}
              </p>
              <img
                src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                alt={characterNFT.name}
              />
              <div className="flex flex-col items-center">
                <progress
                  className="h-8 w-72"
                  value={characterNFT.hp}
                  max={characterNFT.maxHp}
                />
                <p className="text-xl font-semibold absolute">{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
              <h4 className="bg-red-500 mt-2 h-8 w-72 text-xl font-semibold">{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
            <button
              type="button"
              class="mt-10 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 rounded-lg text-xl font-extrabold px-5 py-2.5 text-center mr-2 mb-2"
              onClick={runRecoverAction}
            >
              {`💖 Recover ${characterNFT.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Arena;
