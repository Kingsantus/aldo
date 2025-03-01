"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function UserInfo() {
  const { publicKey } = useWallet();
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

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      (async function getBalanceEvery10Seconds() {
        try {
          const newBalance = await connection.getBalance(publicKey);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
          let tokenList = tokenAccounts.value.map((account) => {
            const info = account.account.data.parsed.info;
            return {
              mint: info.mint,
              amount: info.tokenAmount.uiAmount, // Token balance
              decimals: info.tokenAmount.decimals
            };
          });

          // Fetch token prices from CoinGecko
          const tokenMints = tokenList.map((t) => t.mint).join(",");
          const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${tokenMints}&vs_currencies=usd`);
          const prices = await priceResponse.json();

          // Fetch SOL price from CoinGecko
          const solPriceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`);
          const solPriceData = await solPriceResponse.json();
          setSolPrice(solPriceData.solana.usd);

          // Map token amounts to USD value
          tokenList = tokenList.map((token) => ({
            ...token,
            usdValue: prices[token.mint]?.usd ? prices[token.mint].usd * token.amount : "N/A"
          }));

          setTokens(tokenList);
          setBalance(newBalance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
          setInterval(getBalanceEvery10Seconds, 360000);
        }
      })();
    }
  }, [publicKey, connection]);

  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not Connected");
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ]);
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );
      if (sigResult) {
        alert("Airdrop was confirmed!");
      }
    } catch (err) {
      console.error(err);
      alert("You are Rate limited for Airdrop");
    }
  };

 return (
  <main className="flex flex-col h-screen mt-4 py-10 lg:py-20 mb-4 items-center justify-evenly p-24">
    {publicKey ? (
      <div className="w-full max-w-2xl">
        {loading ? (
          <p className="text-center text-gray-500">Loading tokens...</p>
        ) : tokens.length > 0 ? (
          <div className="max-w-full">
            <h1>Your Public key is: {publicKey?.toString()}</h1>
            <h2>Your Balance is: {balance} SOL</h2>
            <h2>Your Balance is: {solPrice ? `$${(balance * solPrice).toFixed(2)}` : "N/A"} in USD</h2>
            <ul>
              {tokens.map((token, index) => (
                <li key={index} className="p-2 border-b">
                  <p><strong>Mint:</strong> {token.mint}</p>
                  <p><strong>Balance:</strong> {token.amount}</p>
                  <p><strong>Value:</strong> ${token.usdValue}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No tokens found in this wallet.</p>
        )}
        <button
          onClick={getAirdropOnClick}
          type="button"
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          Get Airdrop
        </button>
      </div>
    ) : (
      <h1>Wallet is not connected</h1>
    )}
  </main>
);
}