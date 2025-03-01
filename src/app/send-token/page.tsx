"use client";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";

const connection = new Connection("https://api.devnet.solana.com");

export default function SendToken() {
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<{ mint: string; balance: string }[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState(0);

  useEffect(() => {
    const get = async () => {
      try {
        await getSolBalance();
        await getSPLToken();
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };
    get();
  }, [publicKey]);

  const getSolBalance = async () => {
    if (!publicKey) return;

    const balance = await connection.getBalance(publicKey);
    if (balance) {
      setSolBalance(balance / LAMPORTS_PER_SOL);
    }
  };

  const getSPLToken = async () => {
    if (!publicKey) return;

    const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const tokens = userTokenAccounts.value.map((account) => {
      const token = account.account.data.parsed.info;
      return {
        mint: token.mint,
        balance: token.tokenAmount.uiAmountString,
      };
    });

    setTokens(tokens);
  };

  const sendSol = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);

      const recipientPubKey = new PublicKey(recipientAddress);
      const tx = new Transaction();

      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: +amount * LAMPORTS_PER_SOL,
        })
      );

      tx.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      alert(`Transaction confirmed: ${signature}`);
    } catch (err) {
      console.error("Error sending SOL:", err);
      alert("Failed to send SOL.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendSPL = async (mint: string) => {
    if (!publicKey) return;

    try {
      setIsLoading(true);

      const recipientPubKey = new PublicKey(recipientAddress);
      const mintPubKey = new PublicKey(mint);

      const userTokenAccount = await getAssociatedTokenAddress(mintPubKey, publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubKey, recipientPubKey);

      const tx = new Transaction();

      const checkATA = await connection.getAccountInfo(toTokenAccount);
      if (!checkATA) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            toTokenAccount,
            recipientPubKey,
            mintPubKey
          )
        );
      }

      const decimalNum = await getTokenDecimals(mintPubKey);
      const amountBigInt = BigInt(+amount * Math.pow(10, decimalNum));

      tx.add(
        createTransferInstruction(
          userTokenAccount,
          toTokenAccount,
          publicKey,
          amountBigInt
        )
      );

      tx.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      alert(`Transaction confirmed: ${signature}`);
    } catch (err) {
      console.error("Error sending SPL Token:", err);
      alert("Failed to send SPL Token.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenDecimals = async (mint: PublicKey) => {
    const info = await connection.getParsedAccountInfo(mint);

    if (!info.value) {
      throw new Error("Failed to fetch Decimal");
    }

    return (info.value.data as ParsedAccountData).parsed.info.decimals;
  };

  return (
    <main className="flex flex-col h-screen mt-4 py-10 lg:py-20 mb-4 items-center justify-evenly p-24">
      {publicKey ? (
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading tokens...</p>
          ) : (
            <div>
              <h1>Your Public Key: {publicKey?.toString()}</h1>
              <h2>Your Balance: {solBalance} SOL</h2>

              <h3 className="mt-4">Tokens:</h3>
              <ul>
                {tokens.map((token, index) => (
                  <li key={index} className="p-2 border-b">
                    <p><strong>Mint:</strong> {token.mint}</p>
                    <p><strong>Balance:</strong> {token.balance}</p>
                  </li>
                ))}
              </ul>

              {/* Send Transaction Form */}
              <div className="mt-6">
                <h3>Send Tokens</h3>
                <input
                  type="text"
                  placeholder="Recipient Public Key"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border p-2 w-full mb-2"
                />
                <select
                  onChange={(e) => setSelectedToken(e.target.value || null)}
                  className="border rounded-md p-2 w-full"
                >
                  <option className="bg-gray-500" value="">SOL</option>
                  {tokens.map((token) => (
                    <option className="bg-gray-500" key={token.mint} value={token.mint}>
                      {token.mint}
                    </option>
                  ))}
                </select>
                <button
                  onClick={selectedToken ? () => sendSPL(selectedToken) : sendSol}
                  disabled={isLoading}
                  className="text-blue-900 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-2"
                >
                  {isLoading ? "Sending..." : `Send ${selectedToken ? "SPL Token" : "SOL"}`}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <h1>Wallet is not connected</h1>
      )}
    </main>
  );
}