import { useFloorPrice } from "../hook/useFloorPrice";


interface FloorPriceProps {
    collectionSymbol: string;
}

const FloorPrice = ({ collectionSymbol }: FloorPriceProps) => {
    const floorPrice = useFloorPrice(collectionSymbol);

    return (
        <div className="p-4 bg-blue-500 text-white rounded-md">
            Floor Price: {floorPrice} SOL
        </div>
    );
};

export default FloorPrice;