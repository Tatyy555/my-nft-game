// コントラクトアドレス
const CONTRACT_ADDRESS = "0xDe666AbB9dd8fa3E337F6524297E4C6a84A38AF7";

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