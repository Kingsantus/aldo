import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const metaplex = Metaplex.make(connection);

export const getNFTsByWallet = async (walletAddress: string) => {
    const owner = new PublicKey(walletAddress);
    const nfts = await metaplex.nfts().findAllByOwner({ owner });
    return nfts.map(nft => ({
        mint: nft.mintAddress.toString(),
        name: nft.name,
        image: nft.metadataUri,
    }));
};
