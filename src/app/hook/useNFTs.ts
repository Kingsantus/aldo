import { useState, useEffect } from "react";
import { getNFTsByWallet } from "../services/metaplex";

export const useNFTs = (walletAddress: string) => {
    const [nfts, setNFTs] = useState([]);

    useEffect(() => {
        if (!walletAddress) return;
        const fetchNFTs = async () => {
            const nftData = await getNFTsByWallet(walletAddress);
            setNFTs(nftData);
        };
        fetchNFTs();
    }, [walletAddress]);

    return nfts;
};
