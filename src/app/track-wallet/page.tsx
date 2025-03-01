import Watchlist from "../components/WatchlistAccount";

export default function Page(){
    return (
        <div className='max-w-[90%] mx-auto flex flex-col item-center justify-center'>
            <h1>Solana Wallet Watchlist</h1>
            <Watchlist />
        </div>
    )
}