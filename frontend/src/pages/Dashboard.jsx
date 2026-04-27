import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching slots from /slots...");

        const res = await api.get("/slots");

        console.log("Full axios response:", res);
        console.log("Response data:", res.data);
        console.log("Is response data an array?", Array.isArray(res.data));

        if (Array.isArray(res.data)) {
          setSlots(res.data);
          console.log("Slots state will be set to:", res.data);
        } else {
          console.error("Unexpected API response format:", res.data);
          setSlots([]);
          setError("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load parking slots.");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  console.log("Current slots state:", slots);

  if (loading) {
    return <div>Loading parking slots...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (slots.length === 0) {
    return <div>No parking slots found.</div>;
  }

  return (
    <div>
      <h1>Smart Parking Dashboard</h1>

      {slots.map((slot) => (
        <div key={slot.id}>
          {slot.slot_number} - {slot.status}
        </div>
      ))}
    </div>
  );
}
