// This line waits for the entire HTML page to load before running any code.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. "Grabbing" all the HTML elements we need to talk to ---
    const ytdEl = document.getElementById('ytd-contributions');
    const typePercentEl = document.getElementById('type-percent');
    const typeDollarEl = document.getElementById('type-dollar');
    const sliderEl = document.getElementById('contribution-slider');
    const inputEl = document.getElementById('contribution-input');
    const unitEl = document.getElementById('contribution-unit');
    const saveButton = document.getElementById('save-button');
    const saveStatusEl = document.getElementById('save-status');
    const futureImpactEl = document.getElementById('future-impact-amount');

    // This will store the data we get from the "Brain".
    let appState = {};

    // --- 2. The Main Functions (The "Jobs") ---

    /**
     * JOB 1: Load data from the "Brain" (/api/contribution GET)
     */
    async function loadContributionData() {
        try {
            const response = await fetch('/api/contribution');
            appState = await response.json();
            updateUIFromState(); // Update the webpage with the data
        } catch (error) {
            console.error("Error loading data:", error);
            saveStatusEl.textContent = 'Error loading data.';
        }
    }

    /**
     * JOB 2: Save data to the "Brain" (/api/contribution POST)
     */
    async function saveContributionData() {
        // Build the data object to send
        const dataToSave = {
            ...appState, // This copies all the old data (like age, salary)
            contribution_type: typePercentEl.checked ? 'percent' : 'dollar',
            contribution_value: parseFloat(inputEl.value),
        };

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            const response = await fetch('/api/contribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave), // Turn our object into a JSON string
            });

            const result = await response.json();
            appState = result.data; // Update our state with the saved data
            updateUIFromState(); // Re-sync the UI
            
            saveStatusEl.textContent = 'Changes saved successfully!';
            saveStatusEl.style.color = 'green';
            setTimeout(() => { saveStatusEl.textContent = ''; }, 3000); // Make message disappear

        } catch (error) {
            console.error("Error saving data:", error);
            saveStatusEl.textContent = 'Error saving data.';
            saveStatusEl.style.color = 'red';
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    }

    /**
     * JOB 3: Update all the HTML elements based on our `appState`
     */
    function updateUIFromState() {
        ytdEl.textContent = formatCurrency(appState.ytd_contributions);

        const isPercent = appState.contribution_type === 'percent';
        typePercentEl.checked = isPercent;
        typeDollarEl.checked = !isPercent;

        const value = appState.contribution_value;
        sliderEl.value = value;
        inputEl.value = value;
        
        updateInputConstraints(isPercent);
        updateFutureImpact(); // Recalculate impact
    }
    
    // --- 3. Helper Functions (smaller jobs) ---

    /**
     * This runs when you click the "Percent" or "Dollar" radio buttons.
     */
    function onTypeChange() {
        const isPercent = typePercentEl.checked;
        updateInputConstraints(isPercent);
        
        // Reset to a default value when switching
        const defaultValue = isPercent ? 5 : 100;
        sliderEl.value = defaultValue;
        inputEl.value = defaultValue;

        updateFutureImpact();
    }
    
    /**
     * This runs when you move the slider or type in the box.
     */
    function onValueChange(e) {
        const value = e.target.value;
        sliderEl.value = value; // Sync the slider
        inputEl.value = value;  // Sync the text box
        updateFutureImpact(); // Recalculate
    }

    /**
     * Changes the slider's max/min/step values
     */
    function updateInputConstraints(isPercent) {
        if (isPercent) {
            sliderEl.max = 50;
            sliderEl.step = 0.5;
            inputEl.max = 50;
            inputEl.step = 0.5;
            unitEl.textContent = '%';
        } else {
            sliderEl.max = 2000;
            sliderEl.step = 10;
            inputEl.max = 2000;
            inputEl.step = 10;
            unitEl.textContent = '$';
        }
    }

    /**
     * This is the "optional but recommended" feature!
     */
    function updateFutureImpact() {
        const { age, salary } = appState.user_info;
        const currentRate = appState.contribution_value;
        const currentType = appState.contribution_type;
        const newRate = parseFloat(inputEl.value);
        const newType = typePercentEl.checked ? 'percent' : 'dollar';

        let currentAnnual = (currentType === 'percent') ? (salary * (currentRate / 100)) : (currentRate * 26);
        let newAnnual = (newType === 'percent') ? (salary * (newRate / 100)) : (newRate * 26);
        const incrementalAnnual = newAnnual - currentAnnual;
        
        if (incrementalAnnual <= 0) {
            futureImpactEl.textContent = formatCurrency(0);
            return;
        }

        const yearsToGrow = 65 - age;
        const rate = 0.07; // 7% annual return
        const futureValue = incrementalAnnual * ((Math.pow(1 + rate, yearsToGrow) - 1) / rate);

        futureImpactEl.textContent = formatCurrency(futureValue);
    }

    /**
     * A simple helper to make numbers look like money (e.g., "$123,456")
     */
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(num);
    }

    // --- 4. "Wiring up" the event listeners ---
    typePercentEl.addEventListener('change', onTypeChange);
    typeDollarEl.addEventListener('change', onTypeChange);
    sliderEl.addEventListener('input', onValueChange);
    inputEl.addEventListener('input', onValueChange);
    saveButton.addEventListener('click', saveContributionData);

    // --- 5. Initial Load ---
    loadContributionData(); // Get the data from the "Brain" as soon as the page loads
});