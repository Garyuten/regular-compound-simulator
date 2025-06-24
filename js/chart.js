import CompoundCalculator from '../src/calculator.js';

const calculator = new CompoundCalculator();
let myChart; // Chartインスタンスをグローバルに保持

// テストのためにmyChartをグローバルに公開
window.appChart = myChart;

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '運用残高',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: '積立元本',
                    data: [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '年齢'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金額 (円)'
                    }
                }
            }
        }
    });

    // 初期データはsrc/index.jsで計算して渡すため、ここでは削除
    // updateChartAndTable(10000, 30, 0.05);

    const toggleTableButton = document.getElementById('toggleTable');
    const resultsTable = document.getElementById('resultsTable');
    resultsTable.style.display = "table";

});

function updateChartAndTable(annualDetails) {
    // データが空の場合は何もしない
    if (!Array.isArray(annualDetails) || annualDetails.length === 0) return;
    // annualDetailsの内容をログ出力
    console.log('annualDetails:', annualDetails);
    // グラフの更新
    const startAge = annualDetails[0].year; // 修正: 年齢を取得
    console.log('Start Age:', startAge); // startAgeをコンソールに出力
    // 修正済み: 二重宣言を削除
    myChart.data.labels = annualDetails.map((detail, index) => startAge + index); // 修正: 開始年齢からの年数をラベルに設定
    // 60を強制的にpushする処理を削除
    myChart.data.datasets[0].data = annualDetails.map(detail => detail.finalValue);
    myChart.data.datasets[1].data = annualDetails.map(detail => detail.totalInvestment);
    myChart.update();
    myChart.data.datasets[0].data = annualDetails.map(detail => detail.finalValue);
    myChart.data.datasets[1].data = annualDetails.map(detail => detail.totalInvestment);
    myChart.update();

    // テーブルの更新
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = ''; // 既存の行をクリア

    annualDetails.forEach(detail => {
        const row = tbody.insertRow();
        row.setAttribute('role', 'row');
        row.innerHTML = `
            <td role="cell" class="border border-gray-300 p-2 text-right">${detail.year}</td>
            <td role="cell" class="border border-gray-300 p-2 text-right">${detail.totalInvestment.toLocaleString()}</td>
            <td role="cell" class="border border-gray-300 p-2 text-right">${detail.totalReturn.toLocaleString()}</td>
            <td role="cell" class="border border-gray-300 p-2 text-right">${detail.finalValue.toLocaleString()}</td>
        `;
    });
}

// 仮の入力値でチャートとテーブルを更新する関数をエクスポート
// 実際にはフォーム入力から値を取得して呼び出す
export { updateChartAndTable };