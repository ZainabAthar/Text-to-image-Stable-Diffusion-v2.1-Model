'use client';
import { useState } from 'react';
import './styles.css'; // Import the CSS file

export default function Page() {
  const [inputData, setInputData] = useState(''); // Store user input
  const [imageUrl, setImageUrl] = useState(null); // Store the image URL
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Handle input change
  const handleInputChange = (e) => setInputData(e.target.value);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading state
    setError(null); // Reset error state

    try {
      // Make a request to the backend API
      const res = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputData }),
      });

      const data = await res.json();

      if (res.ok) {
        // If the response is OK, set the image URL
        if (data.imageUrl) {
          const base64Data = 'data:image/png;base64,' + data.imageUrl;
          setImageUrl(base64Data);
        } else {
          setError('No image URL returned.');
        }
      } else {
        // Handle errors returned from the backend
        setError(data.message || 'Failed to generate image');
      }
    } catch (err) {
      // Handle any network or unexpected errors
      console.error('Error:', err); // Log the error to console for debugging
      setError('Error connecting to the server');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="container">
      <h1>Image Generator</h1>

      {/* Input form for user data */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputData}
          onChange={handleInputChange}
          placeholder="Enter your input"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {/* Display loading indicator */}
      {loading && <p>Loading...</p>}

      {/* Display error message */}
      {error && <p className="error">{error}</p>}

      {/* Display the generated image */}
      {imageUrl && <img src={imageUrl} alt="Generated Image" />}
    </div>
  );
}
