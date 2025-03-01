"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { useEffect, useState } from "react";

export default function UserInfo() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  interface Token {
    mint: string;
    amount: number;
    decimals: number;
    usdValue?: number | string;
  }

  const [tokens, setTokens] = useState<Token[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);

  // Transaction states
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [tokenMint, setTokenMint] = useState<string | null>(null); // If null, it's SOL

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      (async function fetchWalletData() {
        try {
          // Fetch SOL balance
          const newBalance = await connection.getBalance(publicKey);
          setBalance(newBalance / LAMPORTS_PER_SOL);

          // Fetch SPL tokens
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
          const tokenList = tokenAccounts.value.map((account) => {
            const info = account.account.data.parsed.info;
            return {
              mint: info.mint,
              amount: info.tokenAmount.uiAmount,
              decimals: info.tokenAmount.decimals
            };
          });

          // Fetch SOL price
          const solPriceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`);
          const solPriceData = await solPriceResponse.json();
          setSolPrice(solPriceData.solana.usd);

          setTokens(tokenList);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [publicKey, connection]);

  // Function to send SOL
  const sendSOL = async () => {
    try {
        if (!publicKey || !signTransaction) {
            throw new Error("Wallet is not connected.");
        }

        const recipientPubKey = new PublicKey(recipient);

        // Create a new transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        );

        // ✅ Fetch recent blockhash and set it
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign and send transaction
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        await connection.confirmTransaction(signature, "confirmed");
        alert(`✅ SOL sent! Transaction: ${signature}`);

    } catch (error) {
        console.error("❌ SOL Transaction Error:", error);
        alert("Failed to send SOL.");
    }
};


  // Function to send SPL Token
const sendSPL = async () => {
    try {
        if (!publicKey || !signTransaction) {
            throw new Error("Wallet is not connected.");
        }

        const mintAddress = new PublicKey("TOKEN_MINT_ADDRESS_HERE"); // Replace with your token mint
        const recipientPubKey = new PublicKey(recipient);

        // Get sender & recipient token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(mintAddress, publicKey);
        const recipientTokenAccount = await getAssociatedTokenAddress(mintAddress, recipientPubKey);

        // Create SPL Token Transfer Instruction
        const transferInstruction = createTransferInstruction(
            senderTokenAccount, // Sender token account
            recipientTokenAccount, // Recipient token account
            publicKey, // Owner of sender account
            amount * LAMPORTS_PER_SOL // Amount in smallest unit
        );

        // Create Transaction
        const transaction = new Transaction().add(transferInstruction);

        // ✅ Fetch recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign & send transaction
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        await connection.confirmTransaction(signature, "confirmed");
        alert(`✅ SPL Token Sent! Transaction: ${signature}`);

    } catch (error) {
        console.error("❌ SPL Transaction Error:", error);
        alert("Failed to send SPL tokens.");
    }
};


  return (
    <main className="flex flex-col h-screen mt-4 py-10 lg:py-20 mb-4 items-center justify-evenly p-24">
      {publicKey ? (
        <div className="w-full max-w-2xl">
          {loading ? (
            <p className="text-center text-gray-500">Loading tokens...</p>
          ) : (
            <div>
              <h1>Your Public Key: {publicKey?.toString()}</h1>
              <h2>Your Balance: {balance} SOL</h2>
              <h2>USD Value: {solPrice ? `$${(balance * solPrice).toFixed(2)}` : "N/A"}</h2>

              <h3 className="mt-4">Tokens:</h3>
              <ul>
                {tokens.map((token, index) => (
                  <li key={index} className="p-2 border-b">
                    <p><strong>Mint:</strong> {token.mint}</p>
                    <p><strong>Balance:</strong> {token.amount}</p>
                  </li>
                ))}
              </ul>

              {/* Send Transaction Form */}
              <div className="mt-6">
                <h3>Send Tokens</h3>
                <input
                  type="text"
                  placeholder="Recipient Public Key"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="border p-2 w-full mb-2"
                />
                <select
                  onChange={(e) => setTokenMint(e.target.value || null)}
                  className="border p-2 w-full mb-2"
                >
                  <option value="">SOL</option>
                  {tokens.map((token) => (
                    <option className="bg-transparent" key={token.mint} value={token.mint}>{token.mint}</option>
                  ))}
                </select>
                <button
                  onClick={tokenMint ? sendSPL : sendSOL}
                  className="text-blue-900 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-2"
                >
                  Send {tokenMint ? "SPL Token" : "SOL"}
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
