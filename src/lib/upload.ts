export async function uploadToServer(file: Buffer, fileName: string, mimeType: string) {
    const endpoint = process.env.UPLOAD_ENDPOINT;
    if (!endpoint) {
        throw new Error('Upload endpoint not configured');
    }

    const apiKey = process.env.UPLOAD_API_KEY;
    if (!apiKey) {
        throw new Error('Upload API key not configured');
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file)], { type: mimeType });
    formData.append('file', blob, fileName);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        let result;
        const responseText = await response.text();
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Server response was not JSON:', responseText);
            throw new Error(`Server did not return JSON. Response: ${responseText.substring(0, 200)}...`);
        }

        // Assuming the server returns something like { url: "..." } or { success: true, link: "..." }
        // We'll try to find a URL in the response
        const fileUrl = result.url || result.link || result.filePath || result.file_url;

        if (!fileUrl) {
            console.log('Server response:', result);
            throw new Error('Server did not return a file URL');
        }

        return fileUrl;
    } catch (error: any) {
        console.error('Upload error:', error);
        throw new Error(`Gagal upload ke server: ${error.message}`);
    }
}
