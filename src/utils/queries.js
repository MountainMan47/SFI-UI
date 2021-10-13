export const TOKEN = `
query Token($id: String) {
  token(id: $id){
    id
    symbol
    name
    decimals
    derivedETH
    totalLiquidity
  }
}`;

export const AVAXPRICE = `
query AVAXPrice($id: Int, $block: Int) {
  bundle(id: $id, block: {number: $block}) {
    ethPrice
  }
}
`;

export const TOTALLIQUIDITY = `
query TOTALLIQUIDITY($id: Int) {
  token(id: $id){
    totalLiquidity
  }
}
`;