const API_BASE_URL = "http://localhost:3000/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkAuth') {
        fetch(`${API_BASE_URL}/auth/session`)
            .then(res => res.json())
            .then(data => {
                const authenticated = data && Object.keys(data).length > 0;
                sendResponse({ authenticated });
            })
            .catch(err => {
                console.error('Auth check failed:', err);
                sendResponse({ authenticated: false });
            });
        return true; // Keep message channel open
    }

    if (request.action === 'checkDuplicate') {
        fetch(`${API_BASE_URL}/v1/applications/check-duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload)
        })
            .then(res => res.json())
            .then(data => sendResponse(data))
            .catch(err => {
                console.error('Duplicate check failed:', err);
                sendResponse({ isDuplicate: false });
            });
        return true;
    }

    if (request.action === 'saveApplication') {
        fetch(`${API_BASE_URL}/v1/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to save');
                }
                return res.json();
            })
            .then(data => sendResponse({ success: true, data }))
            .catch(err => {
                console.error('Save failed:', err);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }
});
