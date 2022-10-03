// コントラクトアドレス
const CONTRACT_ADDRESS = "0xB75736Af2b3e9f8DA96f6fDE86149ac2e19Dc3D8";

// NFTキャラクターの属性のオブジェクト
const transformCharacterData = (characterData) => {
  return {
    name:characterData.name,
    imageURI: characterData.imageURI,
    hp:characterData.hp.toNumber(),
    maxHp:characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};


export {CONTRACT_ADDRESS, transformCharacterData};