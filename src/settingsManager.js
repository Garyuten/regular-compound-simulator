const principalInput = document.getElementById('principal');
let currentPeriods = [];

function saveSettings() {
    const settings = {
        principal: parseFloat(principalInput.value) * 10000,
        periods: currentPeriods
    };
    localStorage.setItem('compoundSimulatorSettings', JSON.stringify(settings));
}

function loadSavedSettings() {
    const savedSettings = localStorage.getItem('compoundSimulatorSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        principalInput.value = settings.principal / 10000;
        currentPeriods = settings.periods;
    } else {
        loadPreset('default');
    }
}

export { saveSettings, loadSavedSettings, currentPeriods };