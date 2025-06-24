import CompoundCalculator from './calculator.js';
import { updateChartAndTable } from '../js/chart.js';
import presets from '../js/presets.js'; // プリセットをインポート

const calculator = new CompoundCalculator();

const presetSelect = document.getElementById('presetSelect');
const presetDescription = document.getElementById('presetDescription');
const compoundForm = document.getElementById('compoundForm');
const principalInput = document.getElementById('principal');
const periodsContainer = document.getElementById('periodsContainer');
const newPresetNameInput = document.getElementById('newPresetName');
const savePresetButton = document.getElementById('savePreset');
const toggleSavePresetLink = document.getElementById('toggleSavePresetLink');
const savePresetContainer = document.getElementById('savePresetContainer');
const finalResultsSummary = document.getElementById('finalResultsSummary'); // 新しく追加
 
let currentPeriods = []; // 現在の期間設定を保持する配列

// キーボードナビゲーションのフィールド順序を更新
// timesCompoundedを削除し、startAgeとdurationの順序を調整
const fields = ['startAge', 'duration', 'monthlyContribution', 'annualBonus', 'rate'];
 
// プリセット選択ドロップダウンを初期化
function initializePresetSelect() {
    // 既存のプリセットを追加
    for (const key in presets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = presets[key].name;
        presetSelect.appendChild(option);
    }
    // カスタムプリセットを読み込んで追加
    loadCustomPresets();
    // デフォルトプリセットを読み込む
    loadPreset('default');
}
 
// カスタムプリセットをLocalStorageから読み込み、ドロップダウンに追加
function loadCustomPresets() {
    const customPresets = JSON.parse(localStorage.getItem('customPresets')) || {};
    for (const key in customPresets) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = customPresets[key].name;
        presetSelect.appendChild(option);
    }
}
 
// プリセットを読み込む
function loadPreset(presetKey) {
    const preset = presets[presetKey];
    if (preset) {
        presetDescription.innerHTML = `<h3>${preset.name}</h3><p>${preset.description}</p>`;
        principalInput.value = preset.principal !== undefined ? preset.principal / 10000 : 0; // プリセットにprincipalがあればそれを万円に変換して使用、なければ0
        // プリセットからtimesCompoundedを削除してディープコピー
        currentPeriods = JSON.parse(JSON.stringify(preset.periods)).map(period => {
            const newPeriod = { ...period };
            delete newPeriod.timesCompounded; // timesCompoundedを削除
            return newPeriod;
        });
        renderPeriods();
        calculateAndDisplayResults(); // プリセット読み込み時にも計算を実行
    }
}
 
// 期間入力フィールドをレンダリング
function renderPeriods() {
    periodsContainer.innerHTML = ''; // 既存の期間をクリア
 
    // 最後の空行を追加するために、表示用の配列を作成
    const periodsToRender = [...currentPeriods];
    // 最後の行は常に空白で追加可能にするため、空のオブジェクトを追加
    periodsToRender.push({
        startAge: '',
        duration: '', // endAgeの代わりにdurationを使用
        monthlyContribution: '', // annualContributionをmonthlyContributionに変更
        annualBonus: '',
        rate: ''
        // timesCompoundedは削除
    });
 
    periodsToRender.forEach((period, index) => {
        const row = periodsContainer.insertRow();
        row.setAttribute('role', 'row'); // Markuplint: tbodyの子要素にrole="row"を追加
        row.innerHTML = `
            <td role="cell" class="action-cell">
                ${index < currentPeriods.length ? `<button type="button" class="remove-period" data-index="${index}" title="削除">✕</button>` : ''}
            </td>
            <td role="cell"><input type="number" value="${period.startAge}" data-index="${index}" data-field="startAge" min="0" aria-label="開始年齢"></td>
            <td role="cell"><input type="number" value="${period.duration}" data-index="${index}" data-field="duration" min="0" aria-label="積立期間"></td>
            <td role="cell"><input type="number" value="${period.monthlyContribution}" data-index="${index}" data-field="monthlyContribution" min="0" aria-label="毎月積立額"></td>
            <td role="cell"><input type="number" value="${period.annualBonus}" data-index="${index}" data-field="annualBonus" min="0" aria-label="年間ボーナス"></td>
            <td role="cell"><input type="number" value="${(period.rate !== '' ? (period.rate * 100).toFixed(2) : '')}" step="0.01" data-index="${index}" data-field="rate" min="0" aria-label="年利"></td>
            <!-- 複利回数は削除 -->
        `;
    });
 
    // イベントリスナーを再設定
    addPeriodEventListeners();
    setupKeyboardNavigation(); // キーボードナビゲーションを設定
}

// 現在フォーカスされている入力フィールドを追跡
let activeCellInput = null;

// 期間入力フィールドのイベントリスナーを設定
function addPeriodEventListeners() {
    periodsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', (event) => {
            if (activeCellInput) {
                activeCellInput.closest('td').classList.remove('focused');
            }
            activeCellInput = event.target;
            activeCellInput.closest('td').classList.add('focused');
        });

        input.addEventListener('blur', (event) => {
            // blurイベントはchangeイベントの前に発生するため、activeCellInputをすぐにクリアしない
            // キーボードナビゲーションで次のセルに移動する場合、blurの後にfocusが来るため
            // ここではactiveCellInputをクリアせず、focusイベントで新しいセルに設定する
            // もしactiveCellInputがnullでなければ、focusedクラスを削除
            if (activeCellInput && activeCellInput === event.target) {
                activeCellInput.closest('td').classList.remove('focused');
                activeCellInput = null;
            }
        });

        input.addEventListener('change', (event) => {
            const index = parseInt(event.target.dataset.index);
            const field = event.target.dataset.field;
            let value = event.target.value.trim(); // 空白をトリム

            // 空の入力はnullとして扱う
            if (value === '') {
                value = null;
            } else {
                value = parseFloat(value);
                if (field === 'rate') {
                    value = value / 100; // %を小数に変換
                }
            }

            // 新しい期間の入力の場合
            if (index === currentPeriods.length) {
                // 少なくとも1つのフィールドに値が入力されたら新しい期間として追加
                if (value !== null) {
                    const newPeriod = {
                        startAge: null,
                        duration: null, // endAgeの代わりにdurationを使用
                        monthlyContribution: null, // annualContributionをmonthlyContributionに変更
                        annualBonus: null,
                        rate: null
                        // timesCompoundedは削除
                    };
                    newPeriod[field] = value;
                    currentPeriods.push(newPeriod);
                    renderPeriods(); // 新しい行を追加するために再レンダリング
                    // 新しい行が追加された後、元の入力フィールドにフォーカスを戻す
                    // ただし、これはrenderPeriods()がDOMを再構築するため、直接はできない
                    // setupKeyboardNavigation()で処理される
                }
            } else {
                currentPeriods[index][field] = value;
            }
            calculateAndDisplayResults(); // 入力変更時に自動計算
            saveSettings(); // 入力変更時に設定を保存

            // 行追加時の自動計算・コピーロジック
            if (index === currentPeriods.length - 1 && (field === 'startAge' || field === 'duration')) {
                const prevPeriod = currentPeriods[index - 1];
                const currentPeriod = currentPeriods[index];

                if (prevPeriod) {
                    // 開始年齢 + 積立期間 を入れたら次の行の開始年齢を自動計算
                    if (currentPeriod.startAge !== null && currentPeriod.duration !== null) {
                        const nextStartAge = currentPeriod.startAge + currentPeriod.duration;
                        if (periodsToRender[index + 1]) { // 次の行が存在する場合
                            periodsToRender[index + 1].startAge = nextStartAge;
                            // 他の列は上と同じ情報をコピー
                            periodsToRender[index + 1].monthlyContribution = prevPeriod.monthlyContribution;
                            periodsToRender[index + 1].annualBonus = prevPeriod.annualBonus;
                            periodsToRender[index + 1].rate = prevPeriod.rate;
                            renderPeriods();
                        }
                    }
                    // 一番下の行に開始年齢だけ入れたら上の行の積立期間を自動計算
                    else if (currentPeriod.startAge !== null && currentPeriod.duration === null) {
                        if (prevPeriod.startAge !== null && prevPeriod.duration !== null) {
                            const calculatedDuration = currentPeriod.startAge - prevPeriod.startAge;
                            if (calculatedDuration > 0) {
                                currentPeriod.duration = calculatedDuration;
                                // 他の列は上と同じ情報をコピー
                                currentPeriod.monthlyContribution = prevPeriod.monthlyContribution;
                                currentPeriod.annualBonus = prevPeriod.annualBonus;
                                currentPeriod.rate = prevPeriod.rate;
                                renderPeriods();
                            }
                        }
                    }
                }
            }
        });
    });

    periodsContainer.querySelectorAll('.remove-period').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            currentPeriods.splice(index, 1);
            renderPeriods();
            calculateAndDisplayResults(); // 期間削除時に自動計算
            saveSettings(); // 期間削除時に設定を保存
        });
    });
}

// キーボードナビゲーションを設定
function setupKeyboardNavigation() {
    periodsContainer.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target.tagName === 'INPUT' && target.closest('#periodsContainer')) {
            const inputs = Array.from(periodsContainer.querySelectorAll('input'));
            const currentIndex = inputs.indexOf(target);
            let nextInput = null;

            switch (event.key) {
                case 'Enter':
                    event.preventDefault(); // デフォルトのフォーム送信を防ぐ
                    // 現在の行の最後の入力フィールドの場合、または最後の行の入力フィールドの場合
                    const currentField = target.dataset.field;
                    const fields = ['startAge', 'duration', 'annualContribution', 'annualBonus', 'rate', 'timesCompounded'];
                    const currentFieldIndex = fields.indexOf(currentField);
                    const currentRowIndex = parseInt(target.dataset.index);

                    if (currentFieldIndex < fields.length - 1) {
                        // 同じ行の次のフィールドへ
                        nextInput = inputs[currentIndex + 1];
                    } else {
                        // 次の行の最初のフィールドへ
                        nextInput = periodsContainer.querySelector(`tr[data-row-index="${currentRowIndex + 1}"] input[data-field="startAge"]`);
                        if (!nextInput) {
                            // 最後の行の最後のフィールドでEnterが押された場合、新しい行を追加
                            if (currentRowIndex === currentPeriods.length) {
                                // 新しい行を追加する処理はchangeイベントでトリガーされるため、ここではフォーカス移動のみ
                                // ただし、renderPeriods()が呼ばれるとDOMが再構築されるため、
                                // ここで直接次の入力フィールドにフォーカスすることはできない。
                                // renderPeriods()後に再度フォーカスを設定する必要がある。
                                // 一旦、何もしないでおく。
                            }
                        }
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    nextInput = inputs[currentIndex + 1];
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    nextInput = inputs[currentIndex - 1];
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    const nextRowIndexDown = parseInt(target.dataset.index) + 1;
                    nextInput = periodsContainer.querySelector(`input[data-index="${nextRowIndexDown}"][data-field="${target.dataset.field}"]`);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    const nextRowIndexUp = parseInt(target.dataset.index) - 1;
                    nextInput = periodsContainer.querySelector(`input[data-index="${nextRowIndexUp}"][data-field="${target.dataset.field}"]`);
                    break;
            }

            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}
 
// フォーム送信時の処理 (計算ボタン削除のため不要)
// compoundForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     calculateAndDisplayResults();
// });
 
// 計算を実行し、結果を表示
function calculateAndDisplayResults() {
    const principal = parseFloat(principalInput.value) * 10000; // 万円を円に変換
    if (isNaN(principal)) {
        // alert('初期元本を正しく入力してください。'); // 自動計算のためアラートは出さない
        updateChartAndTable([]); // 不正な場合はチャートをクリア
        return;
    }
 
    // 空の期間をフィルタリング
    const validPeriods = currentPeriods.filter(period => {
        // 期間内のすべてのフィールドがnullまたは空でないことを確認
        return Object.values(period).some(value => value !== null && value !== '');
    });
 
    if (validPeriods.length === 0) {
        // 期間がない場合はチャートとテーブルをクリア
        updateChartAndTable([]);
        console.log('期間が設定されていないため、計算は実行されませんでした。');
        return;
    }
 
    // 複数期間に対応した計算ロジックを呼び出す
    const { annualData, totalInvestment, finalValue, totalReturn, returnRate } = calculator.calculateMultiPeriod(principal, validPeriods);
 
    console.log('=== 定期積立複利シミュレーション結果 ===');
    console.log(`積立総額: ${totalInvestment.toLocaleString()}円`);
    console.log(`最終評価額: ${finalValue.toLocaleString()}円`);
    console.log(`収益額: ${totalReturn.toLocaleString()}円`);
    console.log(`収益率: ${returnRate.toFixed(2)}%`);
 
    // 最終結果のサマリーを表示
    finalResultsSummary.innerHTML = `
        <p><strong>最終評価額:</strong> <span class="result-value">${finalValue.toLocaleString()}円</span></p>
        <p><strong>運用収益:</strong> <span class="result-value">${totalReturn.toLocaleString()}円</span> (<span class="result-value">${returnRate.toFixed(2)}%</span>)</p>
    `;
 
    updateChartAndTable(annualData);
}
 
// プリセット選択時のイベントリスナー
presetSelect.addEventListener('change', (event) => {
    loadPreset(event.target.value);
});
 
// ページロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
    initializePresetSelect();
    // calculateAndDisplayResults(); // loadSavedSettings() または loadPreset() で呼ばれるため不要
    loadSavedSettings(); // 保存された設定を読み込む
 
    // テストのためにプリセットをグローバルに公開
    window.appPresets = presets;
});
 
// 設定をLocalStorageに保存
function saveSettings() {
    const settings = {
        principal: parseFloat(principalInput.value) * 10000, // 万円を円に変換して保存
        periods: currentPeriods
    };
    localStorage.setItem('compoundSimulatorSettings', JSON.stringify(settings));
}
 
// LocalStorageから設定を読み込む
function loadSavedSettings() {
    const savedSettings = localStorage.getItem('compoundSimulatorSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        principalInput.value = settings.principal / 10000; // 円を万円に変換して表示
        currentPeriods = settings.periods;
        renderPeriods();
        calculateAndDisplayResults();
    } else {
        // 保存された設定がない場合はデフォルトプリセットを読み込む
        loadPreset('default');
    }
}
 
// カスタムプリセットを保存
savePresetButton.addEventListener('click', () => {
    const newPresetName = newPresetNameInput.value.trim();
    if (newPresetName) {
        const customPresets = JSON.parse(localStorage.getItem('customPresets')) || {};
        const newPresetKey = `custom_${Date.now()}`; // ユニークなキーを生成
        customPresets[newPresetKey] = {
            name: newPresetName,
            description: `ユーザー定義プリセット: ${newPresetName}`,
            periods: currentPeriods,
            principal: parseFloat(principalInput.value) * 10000 // 万円を円に変換して保存
        };
        localStorage.setItem('customPresets', JSON.stringify(customPresets));
 
        // ドロップダウンに新しいプリセットを追加
        const option = document.createElement('option');
        option.value = newPresetKey;
        option.textContent = newPresetName;
        presetSelect.appendChild(option);
        presetSelect.value = newPresetKey; // 新しく保存したプリセットを選択状態にする
 
        alert(`設定 "${newPresetName}" を保存しました！`);
        newPresetNameInput.value = ''; // 入力フィールドをクリア
        savePresetContainer.style.display = 'none'; // 保存後に閉じる
    } else {
        alert('設定保存名を入力してください。');
    }
});
 
// 「この設定をブラウザに保存する」リンクのイベントリスナー
toggleSavePresetLink.addEventListener('click', (event) => {
    event.preventDefault(); // デフォルトのリンク動作をキャンセル
    const isHidden = savePresetContainer.style.display === 'none';
    savePresetContainer.style.display = isHidden ? 'block' : 'none';
    toggleSavePresetLink.textContent = isHidden ? '設定保存を閉じる' : 'この設定をブラウザに保存する';
});
 
// 入力フィールドの変更時に設定を保存 (自動計算と同時に行われるため、重複を避ける)
// compoundForm.addEventListener('change', saveSettings);
// periodsContainer.addEventListener('change', saveSettings);
principalInput.addEventListener('change', () => {
    saveSettings();
    calculateAndDisplayResults(); // 初期元本変更時にも自動計算
});