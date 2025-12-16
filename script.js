document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE'; // <--- PASTE YOUR N8N URL HERE

    // DOM Elements - Make sure these match your HTML IDs
    const selectors = {
        energyGroup: '#energy-section',
        moodGroup: '#mood-section',
        focusGroup: '#focus-section',
        anxietyGroup: '#anxiety-section',
        nauseaGroup: '#nausea-section',
        painLevelGroup: '#pain-level-section',
        painLocationGroup: '#pain-location-map',
        notesInput: '#notes-area',
        submitButton: '#log-it-btn',
        activeClass: 'active' // Class added when a button is tapped
    };

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    // Get value from single-choice button groups (Energy, Mood, etc.)
    function getSingleValue(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return null;
        const activeEl = container.querySelector(`.${selectors.activeClass}`);
        // Returns data-value if present, otherwise the text inside the button
        return activeEl ? (activeEl.getAttribute('data-value') || activeEl.innerText.trim()) : null;
    }

    // Get values from multi-choice groups (Pain Location)
    function getMultiValues(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return [];
        const activeEls = container.querySelectorAll(`.${selectors.activeClass}`);
        // Returns an array of strings: ["Head", "Back"]
        return Array.from(activeEls).map(el => el.getAttribute('data-value') || el.innerText.trim());
    }

    // ==========================================
    // MAIN LOGIC
    // ==========================================

    const logButton = document.querySelector(selectors.submitButton);

    if (logButton) {
        logButton.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Generate Timestamp and Title for Notion
            const now = new Date();
            const isoTimestamp = now.toISOString(); // Format: 2025-12-16T07:00:00.000Z
            const entryTitle = `Health Log - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

            // 2. Construct Payload mapped to your Notion Properties
            const payload = {
                "Entry": entryTitle,               // Required for Notion Title property
                "Timestamp": isoTimestamp,         // For "Timestamp" Date property
                "Energy": getSingleValue(selectors.energyGroup),
                "Mood": getSingleValue(selectors.moodGroup),
                "Focus": getSingleValue(selectors.focusGroup),
                "Anxiety": getSingleValue(selectors.anxietyGroup),
                "Nausea": getSingleValue(selectors.nauseaGroup),
                "Pain Level": getSingleValue(selectors.painLevelGroup),
                "Pain Location": getMultiValues(selectors.painLocationGroup), // Sends Array
                "Notes": document.querySelector(selectors.notesInput)?.value || ""
                // Note: Fields like 'Sleep Hours' are omitted since they aren't in your current UI.
                // You can add them later following the same pattern.
            };

            console.log("Sending to n8n:", payload);

            // 3. UI Feedback (Loading)
            const originalText = logButton.innerText;
            logButton.innerText = "Sending...";
            logButton.style.opacity = "0.7";
            logButton.disabled = true;

            try {
                // 4. Send Data to n8n Webhook
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('✨ Logged successfully to Notion!');
                    // Optional: clear the selection after success
                    // window.location.reload(); 
                } else {
                    throw new Error('Server response was not 200');
                }
            } catch (error) {
                console.error('Error logging data:', error);
                alert('❌ Error: Could not connect to n8n.');
            } finally {
                // Restore button
                logButton.innerText = originalText;
                logButton.style.opacity = "1";
                logButton.disabled = false;
            }
        });
    } else {
        console.error("Log button not found! Check ID: " + selectors.submitButton);
    }
});
