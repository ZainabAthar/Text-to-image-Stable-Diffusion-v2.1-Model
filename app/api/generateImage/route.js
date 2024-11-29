import { NextResponse } from 'next/server';

export async function POST(request) {
	const { input } = await request.json();
	console.log('Received input:', input); // Log the input

	// if (!input) return res.status(400).json({ message: 'Input is required' })
	if (!input) return NextResponse.json({ message: 'Invalid req', request });

	try {
		const endpointUrl = 'https://us-central1-assignment-02-443109.cloudfunctions.net/stable-diffusion-endpoint';
		// Use your endpoint
		console.log('Calling model endpoint:', endpointUrl); // Log the endpoint

		const headers = {
			'Content-Type': 'application/json',
			Authorization: 'Bearer AIzaSyD6-saBs2rGM5qXBk0o_9hMfknUEYOV3JI',
		};

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
		};

		console.log({ payload });

		const response = await fetch(endpointUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		});

		console.log('CP1');
		// console.log({ response })

		// Log the raw response (to see HTML errors if returned)
		const responseText = await response.json();
		console.log('Raw response from model:', responseText);

		if (!response.ok) return NextResponse.json({ message: 'Invalid req', request });

		// const responseData = JSON.parse(responseText)
		// console.log('Response Data from model:', responseData)
		const imageUrl = responseText.imageUrl || responseText.image_data || responseText.image_base64;

		// res.status(200).json({ imageUrl })
		return NextResponse.json({ imageUrl });
	} catch (error) {
		console.error('Error occurred:', error);
		res.status(500).json({ message: 'Failed to generate image' });
	}
}
