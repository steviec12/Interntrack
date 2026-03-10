chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJob') {
        const data = extractJobData();
        sendResponse(data);
    }
    return true;
});

function extractJobData() {
    const url = window.location.href;
    let title = '';
    let company = '';

    if (url.includes('linkedin.com/jobs')) {
        title = document.querySelector('.jobs-details-top-card__job-title, .job-details-jobs-unified-top-card__job-title')?.innerText?.trim()
            || document.querySelector('.top-card-layout__title')?.innerText?.trim();
        company = document.querySelector('.jobs-details-top-card__company-info a, .job-details-jobs-unified-top-card__company-name a')?.innerText?.trim()
            || document.querySelector('.topcard__org-name-link')?.innerText?.trim();
    }
    else if (url.includes('indeed.com')) {
        title = document.querySelector('.jobsearch-JobInfoHeader-title')?.innerText?.trim();
        // Indeed often has " - job post" appended
        if (title && title.includes(' - job post')) {
            title = title.split(' - job post')[0].trim();
        }
        company = document.querySelector('div[data-company-name="true"]')?.innerText?.trim() || document.querySelector('.jobsearch-CompanyInfoContainer a')?.innerText?.trim();
    }
    else if (url.includes('joinhandshake.com')) {
        // Handshake layout
        title = document.querySelector('.style__job-title___36a0w, h1')?.innerText?.trim();
        company = document.querySelector('.style__employer-name___21I6L, .style__employer-name___1eEZb')?.innerText?.trim() || document.querySelector('a[href*="/employers/"]')?.innerText?.trim();
    }

    return { title, company };
}
