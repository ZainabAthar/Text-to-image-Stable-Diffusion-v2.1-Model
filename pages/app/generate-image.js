// pages/api/generate-image.js
import fetch from 'node-fetch';

// pages/api/generate-image.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { input } = req.body;
      console.log('Received input:', input);  // Log the input
  
      if (!input) {
        return res.status(400).json({ message: 'Input is required' });
      }
  
      try {
        const endpointUrl = process.env.MODEL_ENDPOINT; // Use your endpoint
        console.log('Calling model endpoint:', endpointUrl);  // Log the endpoint
  
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': Bearer ${process.env.GCP_API_KEY},
        };
  
        // const payload = { data: input };
        const payload = {
          instances: [
              {
                prompt: input,
                  num_images: 1,
                  size: '1024x1024',
              },
          ],
          parameters: {
              temperature: 1.0,
              top_p: 0.9,
          },
      }
  
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
  
        // Log the raw response (to see HTML errors if returned)
        const responseText = await response.json();
        console.log('Raw response from model:', responseText);
  
        if (!response.ok) {
          return res.status(response.status).json({ message: responseText });
        }
  
        // const responseData = JSON.parse(responseText);
        // console.log('Response Data from model:', responseData);
        const imageUrl =
            responseText.imageUrl ||
            responseText.image_data ||
            responseText.image_base64

  
        res.status(200).json({ imageUrl });
      } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: 'Failed to generate image' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }