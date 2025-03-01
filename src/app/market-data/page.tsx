"use client";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNFTs } from "../hook/useNFTs";


const NFTCard = dynamic(() => import("../components/NFTCard"), { ssr: false });
const FloorPrice = dynamic(() => import("../components/FloorPrice"), { ssr: false });

export default function Marketplace() {
    const { publicKey } = useWallet();
    const { nfts, isLoading, error } = useNFTs(publicKey ? publicKey.toString() : "");

    if (!publicKey) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-lg text-gray-700">Please connect your wallet to view your NFTs.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-lg text-gray-700">Loading NFTs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-lg text-red-500">Error fetching NFTs: {error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <FloorPrice collectionSymbol="degods" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {nfts.map((nft, index) => (
                    <NFTCard key={index} nft={nft} />
                ))}
            </div>
        </div>
    );
}