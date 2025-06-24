import presets from '../js/presets.js';
import { initializePresetSelect, loadPreset } from './presetManager.js';
import { renderPeriods } from './periodManager.js';
import { calculateAndDisplayResults } from './calculatorDisplay.js';
import { saveSettings, loadSavedSettings, currentPeriods } from './settingsManager.js';

window.appPresets = presets;
console.log('window.appPresets is set:', window.appPresets);
document.addEventListener('DOMContentLoaded', () => {
    window.appPresets = presets;
    console.log('window.appPresets is set:', window.appPresets);
    console.log('DOMContentLoaded event triggered');
    console.log('Checking DOM elements:', {
        presetSelect: document.getElementById('presetSelect'),
        principalInput: document.getElementById('principal'),
        resultsTable: document.getElementById('resultsTable')
    });

    // DOM要素の取得はDOMContentLoaded内で
    const presetSelect = document.getElementById('presetSelect');
    const principalInput = document.getElementById('principal');

    initializePresetSelect();
    loadPreset('default');
    calculateAndDisplayResults();
    console.log('Initial calculation and display of results completed');
    document.getElementById('resultsTable').style.display = 'table';

    presetSelect.addEventListener('change', (event) => {
        loadPreset(event.target.value);
        renderPeriods();
        calculateAndDisplayResults();
    });

    // 入力中も即時計算
    principalInput.addEventListener('input', () => {
        saveSettings();
        calculateAndDisplayResults();
    });
    principalInput.addEventListener('change', () => {
        saveSettings();
        calculateAndDisplayResults();
    });

    // 年利・終了年齢も変更時に即時計算
    const globalRateInput = document.getElementById('globalRate');
    const globalEndAgeInput = document.getElementById('globalEndAge');
    if (globalRateInput && globalEndAgeInput) {
        globalRateInput.addEventListener('input', () => {
            saveSettings();
            calculateAndDisplayResults();
        });
        globalRateInput.addEventListener('change', () => {
            saveSettings();
            calculateAndDisplayResults();
        });
        globalEndAgeInput.addEventListener('input', () => {
            saveSettings();
            calculateAndDisplayResults();
        });
        globalEndAgeInput.addEventListener('change', () => {
            saveSettings();
            calculateAndDisplayResults();
        });
    }
});