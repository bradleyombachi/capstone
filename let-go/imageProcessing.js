const Jimp = require("jimp");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function removeBackgroundAndConvertToGreyscale() {
    const inputPath = './assets/legopic.jpg';
    const outputPath = 'no-bg.png';
    const greyScaleOutputPath = './output/greylego.jpg';

    try {
        // Prepare the form data for the request
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

        // Make the request to remove.bg API
        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            responseType: 'arraybuffer',
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': 'MEWWaAWxEuXpBJtLBAQBxzNu'
            },
            encoding: null
        });

        // Check the response status
        if (response.status !== 200) {
            console.error('Error:', response.status, response.statusText);
            return;
        }

        // Write the image with the background removed
        fs.writeFileSync(outputPath, response.data);

        // Read the image with removed background and convert to greyscale
        const image = await Jimp.read(outputPath);
        image.greyscale().write(greyScaleOutputPath);
        console.log('Background removal and greyscale conversion completed successfully.');
    } catch (error) {
        console.error('Failed to process image:', error);
    }
}

removeBackgroundAndConvertToGreyscale();
