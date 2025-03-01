import React from "react";

const NFTCard = ({ nft }) => {
    return (
        <div className="p-4 border rounded-md shadow-md">
            <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded" />
            <h3 className="mt-2 text-lg font-bold">{nft.name}</h3>
            <p className="text-sm text-gray-500">{nft.mint}</p>
        </div>
    );
};

export default NFTCard;
