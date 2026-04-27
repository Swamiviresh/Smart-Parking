import { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get("/api/slots");

      console.log("API response:", res.data); // debug

      // ✅ Correct handling
      setSlots(res.data);

    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Parking Dashboard</h1>

        {loading ? (
          <p>Loading...</p>
        ) : slots.length === 0 ? (
          <p>No slots available</p>
        ) : (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {slots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  background:
                    slot.status === "available" ? "#d4edda" : "#f8d7da",
                  border: "1px solid #ccc",
                  minWidth: "150px",
                }}
              >
                <h3>{slot.slot_number}</h3>
                <p>Status: {slot.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}