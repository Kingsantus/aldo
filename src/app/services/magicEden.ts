export const fetchFloorPrice = async (collectionSymbol: string) => {
    const response = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${collectionSymbol}/stats`);
    const data = await response.json();
    return data.floorPrice / 1e9; // Convert lamports to SOL
};
