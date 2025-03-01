import React from "react";
import Image from "next/image";

interface NFT {
    image: string;
    name: string;
    mint: string;
}

const NFTCard = ({ nft }: { nft: NFT }) => {
    return (
        <div>
            <Image src={nft.image} alt={nft.name} width={500} height={500} className="w-full h-48 object-cover rounded" />
            <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded" />
            <h3 className="mt-2 text-lg font-bold">{nft.name}</h3>
            <p className="text-sm text-gray-500">{nft.mint}</p>
        </div>
    );
};

export default NFTCard;