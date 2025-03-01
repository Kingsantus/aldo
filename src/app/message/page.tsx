"use client"; 

import { useEffect, useState } from "react";
import Gun from "gun";
import { sendMessage } from "../components/Message";
import { uploadChatToIPFS } from "../components/SaveMessage";
import { useWallet } from "@solana/wallet-adapter-react";

const gun = Gun(["https://gun-manhattan.herokuapp.com/gun"]);

interface Message {
    id: string;
    sender: string;
    receiver: string;
    message: string;
    text: string;
    timestamp: number;
}

export default function ChatUI() {
    const [message, setMessage] = useState("");
    const [receiver, setReceiver] = useState("");
    const [chat, setChat] = useState<Message[]>([]);
    const { publicKey } = useWallet();
    
    useEffect(() => {
        if (!publicKey) return;
        
        const seen = new Set(chat.map((msg) => msg.timestamp));
        gun.get("solana-chat").map().on((data) => {
            if (
                data?.timestamp &&
                !seen.has(data.timestamp) &&
                (data.receiver === publicKey.toString() || data.sender === publicKey.toString())
            ) {
                seen.add(data.timestamp);
                setChat((prev) => [...prev, data]);
            }
        });
    }, [publicKey, chat]);


    const handleSendMessage = async () => {
        if (!message.trim() || !publicKey || !receiver.trim()) return;

        const newMessage: Message = {
            id: `${publicKey.toString()}-${Date.now()}`,
            sender: publicKey.toString(),
            receiver: receiver.trim(),
            message: message,
            text: message,
            timestamp: Date.now(),
        };

        if (chat.some((msg) => msg.timestamp === newMessage.timestamp)) {
            console.warn("Duplicate message detected, ignoring.");
            return;
        }

        const ipfsUrl = await uploadChatToIPFS([...chat, newMessage]);

        if (ipfsUrl) {
            gun.get("solana-chat").set(newMessage);
            
            if (receiver.trim()) {
                const receiverWallet = { publicKey: receiver.trim() };
                sendMessage(receiverWallet, message);
            }

            setMessage("");
        } else {
            console.error("Failed to upload chat.");
        }
    };


    return (
        <div className="max-w-[80%] mx-auto h-screen flex flex-col">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            publicKey && msg.sender === publicKey.toString() ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[75%] p-3 rounded-lg text-sm shadow-md ${
                                publicKey && msg.sender === publicKey.toString()
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-gray-300 text-gray-900 rounded-tl-none"
                            }`}
                        >
                            <p>{msg.message}</p>
                            <div className="text-xs mt-1 flex justify-between text-gray-200">
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                {publicKey && msg.sender === publicKey.toString() && <span>✔✔</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input Area */}
            <div className="p-4 border-t flex flex-col gap-2">
                {/* Receiver Input */}
                <input
                    type="text"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="Enter recipient's public key..."
                    className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                />

                {/* Message Input */}
                <div className="flex items-center gap-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        rows={2}
                        className="flex-1 p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
