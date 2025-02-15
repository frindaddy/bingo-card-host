function sendMessage(payload, webhookUrl) {
    const data = typeof payload === 'string' ? { content: payload } : payload;

    return new Promise((resolve, reject) => {
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                reject(new Error(`Could not send message: ${response.status}`));
            }
            resolve();
        })
        .catch((error) => {
            console.error(error);
            reject(error);
        });
    });
};