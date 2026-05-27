import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function AuctionDetailPage() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchAuction();
    fetchBids();
  }, []);

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/auctions/${id}/bids`);
      setBids(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const placeBid = async () => {
    try {
      await api.post(`/auctions/${id}/bids`, {
        amount: Number(amount),
      });

      alert("Bid placed!");

      fetchAuction();
      fetchBids();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  if (!auction) return <p>Loading...</p>;

  return (
    <div>
      <h1>{auction.title}</h1>

      <p>{auction.description}</p>

      <h3>Current price: {auction.currentHighestBid}</h3>

      <input
        type="number"
        placeholder="Your bid"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={placeBid}>Place Bid</button>

      <h2>Bid History</h2>

      {bids.map((bid) => (
        <div key={bid.id}>
          <p>
            User: {bid.userId} | Amount: {bid.amount}
          </p>
        </div>
      ))}
    </div>
  );
}