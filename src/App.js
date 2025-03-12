import React, { useState } from "react";
import axios from "axios";

function convertSeconds(seconds) {
  seconds = Math.round(seconds);
  let res = "";

  if (seconds > 3600 * 24) {
    const days = Math.floor(seconds / (3600 * 24));
    res += `${days} days `;
    seconds %= 3600 * 24;
  }

  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600);
    res += `${hours} hours `;
    seconds %= 3600;
  }

  const minutes = Math.floor(seconds / 60);
  res += `${minutes} minutes`;

  return res.trim();
}

function App() {
  const [locations, setLocations] = useState(["", ""]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useLastAsEnd, setUseLastAsEnd] = useState(false);
  const MAX_LOCATIONS = 20;

  const validLocationsCount = locations.filter((loc) => loc.trim() !== "").length;

  const getCounterColor = () => {
    if (validLocationsCount >= MAX_LOCATIONS) return "#dc3545";
    if (validLocationsCount >= 15) return "#ffc107";
    return "#28a745";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanLocations = locations.filter((loc) => loc.trim() !== "");

    if (cleanLocations.length < 2) {
      alert("Please enter at least 2 valid locations");
      return;
    }

    setLoading(true);

    const backendUrl =
      process.env.NODE_ENV === "production" ? process.env.REACT_APP_BACKEND_PROD : process.env.REACT_APP_BACKEND_DEV;

    try {
      const response = await axios.post(backendUrl, {
        locations: cleanLocations,
        designated_end: useLastAsEnd,
      });


      if (response.data.error) {
        alert(response.data.error);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }

    setLoading(false);
  };

  const addLocation = () => {
    if (locations.length >= MAX_LOCATIONS) return;
    setLocations([...locations, ""]);
  };

  const removeLocation = (index) => {
    if (locations.length <= 2) return;
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
  };

  return (
    <div className="App" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Greetings, Traveler</h1>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: getCounterColor(), fontWeight: "bold" }}>
          Locations: {validLocationsCount}/{MAX_LOCATIONS}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Start Location */}
        <div style={{ marginBottom: "10px", display: "flex" }}>
          <input
            type="text"
            value={locations[0]}
            onChange={(e) => {
              const newLocations = [...locations];
              newLocations[0] = e.target.value;
              setLocations(newLocations);
            }}
            placeholder="Enter starting location"
            style={{
              width: "100%",
              padding: "8px",
              border: "2px solid #007bff",
              borderRadius: "4px",
              backgroundColor: "#f0f8ff",
            }}
          />
        </div>

        {/* Other Locations */}
        {locations.slice(1).map((location, index) => {
          const isEndPoint = useLastAsEnd && index === locations.length - 2;
          return (
            <div key={index + 1} style={{ marginBottom: "10px", position: "relative" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    const newLocations = [...locations];
                    newLocations[index + 1] = e.target.value;
                    setLocations(newLocations);
                  }}
                  placeholder={
                    isEndPoint && index + 2 === locations.length ? "Enter ending location" : `Location ${index + 2}`
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: isEndPoint ? "2px solid #007bff" : "2px solid #ddd",
                    borderRadius: isEndPoint && "4px",
                    backgroundColor: isEndPoint ? "#f0fff0" : "white",
                  }}
                />

                {/* Button to remove Location */}
                {locations.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(index + 1)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* End Point Toggle */}
        <div
          style={{
            margin: "10px 0",
            padding: "10px",
            border: "1px solid #eee",
            borderRadius: "4px",
            backgroundColor: useLastAsEnd ? "#f8f9fa" : "transparent",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="checkbox" checked={useLastAsEnd} onChange={(e) => setUseLastAsEnd(e.target.checked)} />
            <span style={{ fontWeight: useLastAsEnd ? "bold" : "normal" }}>
              Use last location as end point
              {useLastAsEnd && locations.length > 1 && ` (${locations[locations.length - 1] || "empty"})`}
            </span>
          </label>
        </div>
        {/* Add Location Button */}
        <button
          type="button"
          onClick={addLocation}
          style={{
            width: "100%",
            margin: "10px 0",
            backgroundColor: locations.length >= MAX_LOCATIONS ? "#ccc" : "#28a745",
            color: "white",
            padding: "10px",
            cursor: locations.length >= MAX_LOCATIONS ? "not-allowed" : "pointer",
          }}
          disabled={locations.length >= MAX_LOCATIONS}
        >
          {locations.length >= MAX_LOCATIONS ? "Maximum Reached" : "Add Another Location +"}
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            padding: "8px",
            fontSize: "1.03em",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Calculating..." : "Find Optimal Route"}
        </button>
      </form>

      {/* Tips Section */}
      <div
        style={{
          color: "#666",
          fontSize: "0.9em",
          marginTop: "10px",
          borderTop: "1px solid #eee",
          paddingTop: "10px",
        }}
      >
        <p>Tips:</p>
        <ul>
          <li>
            {useLastAsEnd
              ? "The first location is the starting point, the last location is the ending point. "
              : "Unless you check the box above, the first location is both the starting and ending point, \
                and we'll calculate the optimal full loop."}

            {useLastAsEnd && "We'll find the optimal path between them."}
          </li>
          <li>
            {" "}
            The order that you place all the other locations doesn't matter.
            <br />
            We'll do all the hard work for you.
          </li>
          <li>Minimum 2 locations required</li>
          <li>Maximum {MAX_LOCATIONS} locations allowed</li>
        </ul>
      </div>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
          }}
        >
          <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>Optimal Route</h2>
          <ol style={{ paddingLeft: "20px" }}>
            {result.optimal_route.map((index, i) => (
              <li key={i} style={{ margin: "8px 0" }}>
                {i === 0 && "Start: "}
                {i === result.optimal_route.length - 1 && "End: "}
                {locations[index]} {/* Convert index to city name */}
                {i < result.optimal_route.length - 1 && (
                  <div
                    style={{
                      color: "#666666",
                      fontSize: "0.9em",
                      marginLeft: "20px",
                      marginTop: "4px",
                    }}
                  >
                    ↓ {convertSeconds(result.distance_matrix[index][result.optimal_route[i + 1]])}
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p style={{ fontWeight: "bold", color: "#007bff", marginTop: "15px" }}>
            Total Time: {convertSeconds(result.total_time)}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
