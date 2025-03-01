"use client";
import { useState, useEffect } from 'react';

export default function Watchlist() {
    const [walletAddress, setWalletAddress] = useState('');
    const [watchlist, setWatchlist] = useState<string[]>([]);

    useEffect(() => {
        const storedWatchlist = JSON.parse(localStorage.getItem("sol_watchlist") || '[]') || [];
        setWatchlist(storedWatchlist);
    }, []);

    useEffect(() => {
        localStorage.setItem("sol_watchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = () => {
        if (!walletAddress || watchlist.includes(walletAddress)) return;
        setWatchlist([...watchlist, walletAddress]);
        setWalletAddress('');
    };

    const getInfo = async (wallet: string) => {
    if (!wallet) return alert("Please enter a valid wallet address.");

    try {
        const response = await fetch("https://rpc.ankr.com/solana", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [wallet]
            })
        });

        const data = await response.json();
        if (data.result) {
            alert(`Balance: ${data.result.value / 1e9} SOL`); // Convert from lamports
        } else {
            alert("Wallet not found or empty.");
        }
    } catch (error) {
        console.error("Error fetching wallet info:", error);
        alert("Failed to fetch wallet information.");
    }
};


    return (
        <div className='flex flex-col item-center'>
            <div className='flex flex-row gap-6'>
            <input
                type="text"
                placeholder="Enter wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className='border rounded-sm px-8 py-2 shadow-sm'
            />
            <button className='border py-2 px-8 rounded-md shadow-lg bg-blue-900 text-white' onClick={addToWatchlist}>Add to Watchlist</button>
            </div>

            <ul>
                {watchlist.map((addr, index) => (
                    <li key={index}>
                        {addr} - <a href={`https://solscan.io/account/${addr}`} target="_blank" rel="noopener noreferrer">View</a>
                    </li>
                ))}
            </ul>
            <ul>
                {watchlist.map((addr, index) => (
                    <li key={index} className="flex gap-4 items-center">
                        {addr} - 
                        <a href={`https://solscan.io/account/${addr}`} target="_blank" rel="noopener noreferrer">View</a>
                        <button 
                            className="border px-4 py-1 rounded-md bg-green-600 text-white" 
                            onClick={() => getInfo(addr)}
                        >
                            Fetch Info
                        </button>
                    </li>
                ))}
            </ul>

        </div>
    );
};