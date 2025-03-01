"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useState } from "react";
import { toast } from "react-toastify";
import React from "react";
import ExternalLinkIcon from "../components/externalLinkIcon";

export default function CreateToken() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenDecimals, setTokenDecimals] = useState(6);
    const [tokenSupply, setTokenSupply] = useState(1000);
    const [loading, setLoading] = useState(false);

    const [mintAddress, setMintAddress] = useState<web3.PublicKey | null>(null);
    const [tokenAccount, setTokenAccount] = useState<web3.PublicKey | null>(null);
    const [txSignature, setTxSignature] = useState("");

    const connectionErr = () => {
        if (!publicKey || !connection) {
            toast.error("Please connect your wallet ");
            return true;
        }
        return false;
    };

    const createToken = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (connectionErr()) return;

         setLoading(true); 

        try {
            const mint = web3.Keypair.generate();
            const lamports = await token.getMinimumBalanceForRentExemptAccount(connection);
            
            // Create a mint account
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey!,
                    newAccountPubkey: mint.publicKey,
                    space: token.MINT_SIZE,
                    lamports,
                    programId: token.TOKEN_PROGRAM_ID,
                }),
                token.createInitializeMintInstruction(
                    mint.publicKey,
                    tokenDecimals,
                    publicKey!,
                    null,
                    token.TOKEN_PROGRAM_ID
                )
            );

            // Send transaction
            const signature = await sendTransaction(transaction, connection, { signers: [mint] });
            setMintAddress(mint.publicKey);
            setTxSignature(signature);

            // Create associated token account
            const associatedTokenAccount = await token.getAssociatedTokenAddress(
                mint.publicKey,
                publicKey!
            );

            const createATAInstruction = token.createAssociatedTokenAccountInstruction(
                publicKey!,
                associatedTokenAccount,
                publicKey!,
                mint.publicKey
            );

            const createAccountTx = new web3.Transaction().add(createATAInstruction);
            await sendTransaction(createAccountTx, connection);

            setTokenAccount(associatedTokenAccount);

            // Mint tokens
            const mintTx = new web3.Transaction().add(
                token.createMintToInstruction(
                    mint.publicKey,
                    associatedTokenAccount,
                    publicKey!,
                    tokenSupply * Math.pow(10, tokenDecimals)
                )
            );

            await sendTransaction(mintTx, connection);

            toast.success(`Token ${tokenName} (${tokenSymbol}) created successfully!`);
        } catch (error) {
            toast.error("Error creating token");
            console.error("Token creation error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[80%] mx-auto">
            <form className="p-6 rounded-lg shadow-lg" onSubmit={createToken}>
                <h2 className="font-bold text-2xl text-[#fa6ece] mb-4">Create Token</h2>

                <label className="block text-sm">Token Name</label>
                <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="MyToken"
                    className="w-full p-2 mb-2 bg-transparent border-b border-white"
                    required
                />

                <label className="block text-sm">Token Symbol</label>
                <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="MTK"
                    className="w-full p-2 mb-2 bg-transparent border-b border-white"
                    required
                />

                <label className="block text-sm">Decimals</label>
                <input
                    type="number"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(Number(e.target.value))}
                    placeholder="6"
                    className="w-full p-2 mb-2 bg-transparent border-b border-white"
                    required
                />

                <label className="block text-sm">Supply</label>
                <input
                    type="number"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(Number(e.target.value))}
                    placeholder="1000"
                    className="w-full p-2 mb-4 bg-transparent border-b border-white"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00ffff] p-2 rounded-md flex items-center justify-center"
                    disabled={!publicKey || !connection || loading}
                >
                    {loading ? (
                        <div className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                            Creating...
                        </div>
                    ) : (
                        "Create Token"
                    )}
                </button>
            </form>

            {/* Display results */}
            <div className="text-sm font-semibold bg-[#222524] border border-gray-500 rounded-lg p-2 mt-4">
                {mintAddress && (
                    <div>
                        <span>Token Mint Address: </span>
                        <a href={`https://explorer.solana.com/address/${mintAddress.toBase58()}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-[#80ebff] italic">
                            {mintAddress.toBase58().slice(0, 25)}...
                            <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                )}
                {tokenAccount && (
                    <div>
                        <span>Token Account Address: </span>
                        <a href={`https://explorer.solana.com/address/${tokenAccount.toBase58()}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-[#80ebff] italic">
                            {tokenAccount.toBase58().slice(0, 25)}...
                            <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                )}
                {txSignature && (
                    <div>
                        <span>Transaction Signature: </span>
                        <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-[#80ebff] italic">
                            {txSignature.slice(0, 25)}...
                            <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
