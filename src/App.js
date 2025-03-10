import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [locations, setLocations] = useState(['']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const MAX_LOCATIONS = 20;
  const WARNING_THRESHOLD = 15;

  const validLocationsCount = locations.filter(loc => loc.trim() !== '').length;

  const getCounterColor = () => {
    if (validLocationsCount >= MAX_LOCATIONS) return '#dc3545';
    if (validLocationsCount >= WARNING_THRESHOLD) return '#ffc107';
    return '#28a745';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanLocations = locations.filter(loc => loc.trim() !== '');
    
    if (cleanLocations.length < 2) {
      alert('Please enter at least 2 valid locations');
      return;
    }
    
    if (cleanLocations.length > MAX_LOCATIONS) {
      alert(`Maximum ${MAX_LOCATIONS} locations allowed`);
      return;
    }

    setLoading(true);

    const backendUrl = process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_BACKEND_PROD
      : process.env.REACT_APP_BACKEND_DEV;

    try {
      const response = await axios.post(backendUrl, {
        locations: cleanLocations
      });
      
      setResult(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to calculate route';
      alert(`Error: ${errorMessage}`);
    }
    
    setLoading(false);
  };

  const addLocation = () => {
    if (locations.length >= MAX_LOCATIONS) {
      alert(`Maximum ${MAX_LOCATIONS} locations allowed`);
      return;
    }
    setLocations([...locations, '']);
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Greetings, Traveler</h1>
      
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: getCounterColor(), fontWeight: 'bold' }}>
          Locations: {validLocationsCount}/{MAX_LOCATIONS}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Starting Location (Start & End Point)
          </label>
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
              width: '100%',
              padding: '8px',
              border: '2px solid #007bff',
              borderRadius: '4px',
              backgroundColor: '#f0f8ff'
            }}
          />
        </div>

        {locations.slice(1).map((location, index) => (
          <div key={index + 1} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                const newLocations = [...locations];
                newLocations[index + 1] = e.target.value;
                setLocations(newLocations);
              }}
              placeholder={`Location ${index + 2}`}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: validLocationsCount >= MAX_LOCATIONS ? '1px solid #dc3545' : '1px solid #ddd'
              }}
            />
          </div>
        ))}

        <div style={{ margin: '15px 0' }}>
          <button
            type="button"
            onClick={addLocation}
            style={{ 
              width: '100%',
              marginBottom: '10px',
              backgroundColor: locations.length >= MAX_LOCATIONS ? '#ccc' : '#28a745',
              color: 'white',
              padding: '10px',
              cursor: locations.length >= MAX_LOCATIONS ? 'not-allowed' : 'pointer'
            }}
            disabled={locations.length >= MAX_LOCATIONS}
          >
            {locations.length >= MAX_LOCATIONS ? 'Maximum Locations Reached' : 'Add Another Location +'}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              background: loading ? '#ccc' : '#007bff', 
              color: 'white',
              padding: '12px',
              fontSize: '1.1em',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Calculating Optimal Route...' : 'Find Fastest Route'}
          </button>
        </div>

        <div style={{ 
          color: '#666', 
          fontSize: '0.9em',
          marginTop: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '10px'
        }}>
          <p>Tips:</p>
          <ul>
            <li>The first location will be both the starting and ending point.
                <br /> We calculate the optimal full loop for you.
            </li>
            <li> The order that you place all the other locations doesn't matter.
              <br />We will do all the hard work for you.
            </li>
            <li>Minimum 2 locations required</li>
            <li>Maximum {MAX_LOCATIONS} locations allowed</li>
          </ul>
        </div>
      </form>

      {result && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Optimal Route</h2>
          <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
            {result.optimal_route.map((location, index) => (
                <li key={index} style={{ margin: '8px 0' }}>
                    {index === 0 && 'Start: '}
                    {location}
                </li>
            ))}
            {/* Add the starting location again at the end */}
            <li style={{ margin: '8px 0' }}>
                End: {result.optimal_route[0]} {/* Assuming the first location is the starting point */}
            </li>
        </ol>
          <p style={{ 
            fontWeight: 'bold', 
            marginTop: '15px',
            color: '#007bff'
          }}>
            Total Travel Time: {result.total_time}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;