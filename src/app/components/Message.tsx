import Gun from "gun";

const gun = Gun({
    peers: ["https://gun-manhattan.herokuapp.com/gun"],
});

const messages = gun.get("solana-chat");

interface Wallet {
    publicKey: {
        toString: () => string;
    };
}

export const sendMessage = (wallet: Wallet, message: string) => {
    messages.set({
        sender: wallet.publicKey.toString(),
        message: message,
        timestamp: Date.now(),
    });
};
