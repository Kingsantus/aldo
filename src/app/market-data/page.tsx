import NFTCard from "../components/NFTCard";
import FloorPrice from "../components/FloorPrice";
import { useNFTs } from "../hooks/useNFTs";
import WalletConnect from "../components/WalletConnect";

const Marketplace = ({ wallet }) => {
    const nfts = useNFTs(wallet.publicKey.toString());

    return (
        <div className="container mx-auto p-6">
            <WalletConnect />
            <FloorPrice collectionSymbol="degods" />
            <div className="grid grid-cols-3 gap-4 mt-6">
                {nfts.map((nft, index) => <NFTCard key={index} nft={nft} />)}
            </div>
        </div>
    );
};

export default Marketplace;
