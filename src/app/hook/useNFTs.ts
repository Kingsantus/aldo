"use client";
import { useState, useEffect } from "react";
import { getNFTsByWallet } from "../services/metaplex";

export const useNFTs = (walletAddress: string) => {
    const [nfts, setNFTs] = useState<{ mint: string; name: string; image: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        if (!walletAddress) return;

        const fetchNFTs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const nftData = await getNFTsByWallet(walletAddress);
                setNFTs(nftData);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTs();
    }, [walletAddress]);

    return { nfts, isLoading, error };
};