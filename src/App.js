import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [locations, setLocations] = useState(['']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const backendUrl = process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_BACKEND_PROD
      : process.env.REACT_APP_BACKEND_DEV;
    console.log(process.env)
    console.log(backendUrl)

    if (!backendUrl) {
      alert("Server configuration error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(backendUrl, {
        locations: locations.filter(loc => loc.trim() !== '')
      });
      
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Error calculating route');
    }
    
    setLoading(false);
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Greetings, Traveler</h1>
      
      <form onSubmit={handleSubmit}>
        {locations.map((location, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                const newLocations = [...locations];
                newLocations[index] = e.target.value;
                setLocations(newLocations);
              }}
              placeholder="Enter location"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => setLocations([...locations, ''])}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          Add Location
        </button>
        
        <button
          type="submit"
          disabled={loading}
          style={{ background: loading ? '#ccc' : '#007bff', color: 'white' }}
        >
          {loading ? 'Calculating...' : 'Get the Fastest Route'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Fastest Route</h2>
          <ol>
            {result.optimal_route.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ol>
          <p>Total Time: {(result.total_time)}</p>
        </div>
      )}
    </div>
  );
}

export default App;