const NEXT_PUBLIC_API_URL = "http://localhost:3000/api/v1";
const NEXT_PUBLIC_APP_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loading-state');
    const loginPrompt = document.getElementById('login-prompt');
    const form = document.getElementById('application-form');
    const saveBtn = document.getElementById('save-btn');
    const duplicateWarning = document.getElementById('duplicate-warning');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('errorMessage');
    const viewLink = document.getElementById('view-application-link');

    // Check auth status
    chrome.runtime.sendMessage({ action: 'checkAuth' }, async (response) => {
        loadingState.classList.add('hidden');

        if (!response || !response.authenticated) {
            loginPrompt.classList.remove('hidden');
            return;
        }

        form.classList.remove('hidden');

        // Inject content script to extract details
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Default URL to current tab URL
        document.getElementById('url').value = tab.url;

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            // Once script is injected, ask for data
            chrome.tabs.sendMessage(tab.id, { action: 'extractJob' }, (res) => {
                if (res) {
                    if (res.title) document.getElementById('roleTitle').value = res.title;
                    if (res.company) document.getElementById('companyName').value = res.company;

                    // Check for duplicate
                    checkDuplicate(res.title, res.company);
                }
            });
        });
    });

    const checkDuplicate = (roleTitle, companyName) => {
        if (!roleTitle || !companyName) return;

        chrome.runtime.sendMessage({
            action: 'checkDuplicate',
            payload: { roleTitle, companyName }
        }, (response) => {
            if (response && response.isDuplicate) {
                duplicateWarning.classList.remove('hidden');
            } else {
                duplicateWarning.classList.add('hidden');
            }
        });
    };

    // Re-check duplicate when inputs change
    document.getElementById('roleTitle').addEventListener('blur', (e) => {
        checkDuplicate(e.target.value, document.getElementById('companyName').value);
    });
    document.getElementById('companyName').addEventListener('blur', (e) => {
        checkDuplicate(document.getElementById('roleTitle').value, e.target.value);
    });

    // Handle Save
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        successMessage.classList.add('hidden');
        errorMessage?.classList.add('hidden');

        const payload = {
            roleTitle: document.getElementById('roleTitle').value,
            companyName: document.getElementById('companyName').value,
            url: document.getElementById('url').value || undefined,
            status: document.getElementById('status').value,
            type: document.getElementById('type').value,
        };

        const deadline = document.getElementById('deadline').value;
        if (deadline) {
            payload.deadline = new Date(deadline).toISOString();
        }

        chrome.runtime.sendMessage({
            action: 'saveApplication',
            payload
        }, (response) => {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Application';

            if (response && response.success) {
                successMessage.classList.remove('hidden');
                viewLink.href = `${NEXT_PUBLIC_APP_URL}/dashboard`;
                form.reset();
                duplicateWarning.classList.add('hidden');
            } else {
                if (errorMessage) {
                    errorMessage.classList.remove('hidden');
                    errorMessage.textContent = response?.error || 'Failed to save.';
                } else {
                    alert('Failed to save application: ' + (response?.error || 'Unknown error'));
                }
            }
        });
    });
});
