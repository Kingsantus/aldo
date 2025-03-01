"use client";
import { useState, useEffect } from "react";
import { fetchFloorPrice } from "../services/magicEden";

export const useFloorPrice = (collectionSymbol: string) => {
    const [floorPrice, setFloorPrice] = useState(0);

    useEffect(() => {
        const updatePrice = async () => {
            const price = await fetchFloorPrice(collectionSymbol);
            setFloorPrice(price);
        };

        updatePrice();
        const interval = setInterval(updatePrice, 60000); // Update every 60 sec

        return () => clearInterval(interval);
    }, [collectionSymbol]);

    return floorPrice;
};