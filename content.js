// content.js
(function () {
    function isRepoPage() {
        // Matches https://github.com/{owner}/{repo}
        return /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/.test(window.location.href);
    }

    async function fetchRepoSize(owner, repo) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await fetch(apiUrl);
        if (!response.ok) return null;
        const data = await response.json();
        return data.size ? data.size : null;
    }

    function insertSizeElement(size) {
        // Remove existing element if present
        const existing = document.getElementById('github-size-estimate');
        if (existing) existing.remove();

        let container = document.querySelector('header.Header');
        if (!container) container = document.querySelector('header');
        if (!container) container = document.querySelector('.Layout-main');
        if (!container) container = document.body; // fallback

        const sizeElem = document.createElement('div');
        sizeElem.id = 'github-size-estimate';
        sizeElem.style.position = 'fixed';
        sizeElem.style.top = '48px';
        sizeElem.style.right = '24px';
        sizeElem.style.background = '#24292f';
        sizeElem.style.color = '#fff';
        sizeElem.style.padding = '4px 12px';
        sizeElem.style.borderRadius = '6px';
        sizeElem.style.fontWeight = 'bold';
        sizeElem.style.zIndex = 1000;

        // Format size appropriately
        const sizeInMB = size / 1024;
        let displayText;
        if (sizeInMB >= 1024) {
            displayText = `Repo Size: ${(sizeInMB / 1024).toFixed(1)} GB`;
        } else {
            displayText = `Repo Size: ${sizeInMB.toFixed(1)} MB`;
        }
        sizeElem.textContent = displayText;

        container.appendChild(sizeElem);
    }

    async function main() {
        if (!isRepoPage()) return;
        const [, owner, repo] = window.location.pathname.split('/');
        if (!owner || !repo) return;
        const size = await fetchRepoSize(owner, repo).catch(err => {
            console.log('[GitHub Size Estimate] Error fetching repo size:', err);
            return null;
        });
        if (size !== null) insertSizeElement(size);
    }

    // Run main on initial load
    main();

    // Poll for URL changes as a robust fallback
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('[GitHub Size Estimate] URL changed:', lastUrl);
            setTimeout(main, 300); // slight delay to allow DOM update
        }
    }, 500);
})();
