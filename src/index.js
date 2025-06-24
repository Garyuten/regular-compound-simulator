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
    // 「保存」ボタンのイベントハンドラ追加
    const savePresetButton = document.getElementById('savePreset');
    if (savePresetButton) {
        savePresetButton.addEventListener('click', () => {
            const presetNameInput = document.getElementById('newPresetName');
            const presetName = presetNameInput ? presetNameInput.value.trim() : '';
            console.log('[保存ボタン] 入力された保存名:', presetName);

            if (!presetName) {
                alert('保存名を入力してください');
                return;
            }

            // currentPeriods/principal取得
            const principalInput = document.getElementById('principal');
            const principal = principalInput ? parseFloat(principalInput.value) * 10000 : 0;
            console.log('[保存ボタン] principal:', principal);
            console.log('[保存ボタン] currentPeriods:', currentPeriods);

            // 既存のカスタムプリセットを取得
            let customPresets = {};
            try {
                customPresets = JSON.parse(localStorage.getItem('customPresets')) || {};
            } catch (e) {
                console.warn('customPresets parse error:', e);
            }

            // 保存名の重複チェック
            if (customPresets[presetName]) {
                alert('同じ名前のプリセットが既に存在します');
                return;
            }

            // 保存データ作成
            const newPreset = {
                name: presetName,
                principal: principal,
                periods: JSON.parse(JSON.stringify(currentPeriods))
            };
            customPresets[presetName] = newPreset;
            console.log('[保存ボタン] 保存内容:', newPreset);

            // localStorageへ保存
            try {
                localStorage.setItem('customPresets', JSON.stringify(customPresets));
                console.log('[保存ボタン] localStorageへ保存完了');
            } catch (e) {
                alert('保存に失敗しました: ' + e.message);
                return;
            }

            // プリセットリストを即時更新
            if (typeof loadCustomPresets === 'function') {
                // 既存のカスタムプリセットoptionを一旦削除
                const presetSelect = document.getElementById('presetSelect');
                if (presetSelect) {
                    // デフォルトプリセット以外を削除
                    for (let i = presetSelect.options.length - 1; i >= 0; i--) {
                        if (!presets[presetSelect.options[i].value]) {
                            presetSelect.remove(i);
                        }
                    }
                }
                loadCustomPresets();
            }
            alert('プリセットを保存しました');
        });
    }
});