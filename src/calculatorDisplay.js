import CompoundCalculator from './calculator.js';
import { updateChartAndTable } from '../js/chart.js';

const calculator = new CompoundCalculator();
const finalResultsSummary = document.getElementById('finalResultsSummary');
import { currentPeriods } from './settingsManager.js';

// 3桁ごとにカンマを挿入する関数
export function formatWithCommas(value) {
    if (value === '' || value === null || value === undefined) return '';
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// principal入力欄にカンマ区切り自動挿入
window.addEventListener('DOMContentLoaded', () => {
    // principalInputのカンマ区切り自動挿入は不要（type="number"なので）
});

function calculateAndDisplayResults() {
    console.log('calculateAndDisplayResults function called');
    const principalInput = document.getElementById('principal');
    console.log('Principal input value:', principalInput.value);
    // カンマを除去して数値化
    const principalRaw = principalInput.value.replace(/,/g, '');
    const principal = parseFloat(principalRaw) * 10000;
    if (isNaN(principal)) {
        updateChartAndTable([]);
        return;
    }

    console.log('Current periods before filtering:', currentPeriods);
    const validPeriods = currentPeriods.filter(period => {
        return Object.values(period).some(value => value !== null && value !== '' && value !== undefined);
    });

    // validPeriodsを「万円」→「円」に変換
    const convertedPeriods = validPeriods.map(period => ({
        ...period,
        monthlyContribution: period.monthlyContribution !== undefined && period.monthlyContribution !== ''
            ? parseFloat(String(period.monthlyContribution).replace(/,/g, '')) * 10000
            : 0,
        annualBonus: period.annualBonus !== undefined && period.annualBonus !== ''
            ? parseFloat(String(period.annualBonus).replace(/,/g, '')) * 10000
            : 0,
    }));

    // 注意表示用: 開始年齢の最大値と終了年齢
    const globalEndAgeInput = document.getElementById('globalEndAge');
    const globalEndAge = parseInt(globalEndAgeInput.value, 10);
    let maxStartAge = 0;
    if (convertedPeriods.length > 0) {
        maxStartAge = Math.max(...convertedPeriods.map(p => parseInt(p.startAge, 10) || 0));
    }

    // 注意文表示エリアを終了年齢入力欄の直下に設置
    const warningContainer = document.getElementById('endAgeWarningContainer');
    if (maxStartAge > globalEndAge) {
        warningContainer.textContent = '※ 開始年齢が終了年齢を超えています';
        warningContainer.style.display = 'block';
    } else {
        warningContainer.textContent = '';
        warningContainer.style.display = 'none';
    }

    console.log('Valid periods after filtering:', convertedPeriods);
    if (convertedPeriods.length === 0) {
        updateChartAndTable([]);
        console.log('期間が設定されていないため、計算は実行されませんでした。');
        return;
    }

    console.log('グラフ描画を開始します。');
    const startAge = convertedPeriods[0]?.startAge || 0; // 1行目の開始年齢を取得
    // 年利・終了年齢の全体共通設定を取得
    const globalRateInput = document.getElementById('globalRate');
    const globalRate = parseFloat(globalRateInput.value) / 100; // %→小数

    const { annualData, totalInvestment, finalValue, totalReturn, returnRate } =
        calculator.calculateMultiPeriod(principal, convertedPeriods, globalRate, globalEndAge);

    console.log('グラフ描画が完了しました。');

    console.log('=== 定期積立複利シミュレーション結果 ===');
    console.log(`積立総額: ${totalInvestment.toLocaleString()}円`);
    console.log(`最終評価額: ${finalValue.toLocaleString()}円`);
    console.log(`収益額: ${totalReturn.toLocaleString()}円`);
    console.log(`収益率: ${returnRate.toFixed(2)}%`);

    finalResultsSummary.innerHTML = `
        <div class="flex flex-col items-center gap-2 p-2">
            <div class="flex items-center gap-2">
                <span class="text-xl text-gray-600 font-semibold">最終評価額</span>
                <span class="text-3xl font-extrabold text-blue-700 ml-2">${finalValue.toLocaleString()}円</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xl text-gray-600 font-semibold">運用収益</span>
                <span class="text-2xl md:text-3xl font-extrabold text-green-700 ml-2" style="font-size: 1.5em;">${totalReturn.toLocaleString()}円</span>
                <span class="text-lg font-bold text-blue-600 ml-2">(${returnRate.toFixed(2)}%)</span>
            </div>
        </div>
    `;

    updateChartAndTable(annualData);
}

export { calculateAndDisplayResults, currentPeriods };