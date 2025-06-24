import { renderPeriods } from './periodManager.js';
import presets from '../js/presets.js';
console.log('Presets data:', presets);

const presetSelect = document.getElementById('presetSelect');
const presetDescription = document.getElementById('presetDescription');
const principalInput = document.getElementById('principal');
import { currentPeriods } from './settingsManager.js';
import { formatWithCommas } from './calculatorDisplay.js';

function initializePresetSelect() {
    console.log('initializePresetSelect function called');
    for (const key in presets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = presets[key].name;
        presetSelect.appendChild(option);
    }
    loadCustomPresets();
    loadPreset('default');
}

function loadCustomPresets() {
    const customPresets = JSON.parse(localStorage.getItem('customPresets')) || {};
    for (const key in customPresets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = customPresets[key].name;
        presetSelect.appendChild(option);
    }
    console.log('期間ごとの積立設定を表に反映しました。');
}

let presetKey = 'default'; // 例として 'default' を使用
console.log('Loading preset:', presetKey);
function loadPreset(presetKey) {
    const preset = presets[presetKey];
    console.log('Preset periods:', preset.periods);
    console.log('Current periods before push:', currentPeriods);
    if (preset) {
        console.log('デフォルトの設定を読み込みました:', preset);
        renderPeriods();
        presetDescription.innerHTML = `<h3>${preset.name}</h3><p>${preset.description}</p>`;
        // カンマ区切りせず数値のみセット
        if (preset.principal !== undefined) {
            principalInput.value = preset.principal / 10000;
        } else {
            principalInput.value = '';
        }
        currentPeriods.length = 0;
        currentPeriods.push(...preset.periods.map(period => {
            const endAge = period.endAge !== undefined ? period.endAge : period.startAge + period.duration;
            const newPeriod = {
                startAge: period.startAge,
                duration: endAge - period.startAge,
                monthlyContribution: period.annualContribution !== undefined ? period.annualContribution / 12 : period.monthlyContribution,
                annualBonus: period.annualBonus,
                rate: period.rate
            };
            if (newPeriod.duration <= 0) {
                console.warn('Invalid duration for period:', newPeriod);
            }
            return newPeriod;
        }));
    }
}

export { initializePresetSelect, loadPreset, currentPeriods };