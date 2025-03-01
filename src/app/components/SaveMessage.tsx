import axios from "axios";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT_SECRET;

if (!PINATA_JWT) {
    throw new Error("No Pinata JWT found");
}

interface Message {
    id: string;
    text: string;
    timestamp: number;
}

export const uploadChatToIPFS = async (messages: Message[]) => {
    try {
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            { messages },
            {
                headers: { Authorization: `Bearer ${PINATA_JWT}` },
            }
        );

        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading chat:", error);
        return null;
    }
};
