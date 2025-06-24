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
                    display: true,
                    text: '積立シミュレーション結果'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '年'
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

    toggleTableButton.addEventListener('click', () => {
        if (resultsTable.style.display === 'none') {
            resultsTable.style.display = 'table';
        } else {
            resultsTable.style.display = 'none';
        }
    });
});

function updateChartAndTable(annualDetails) {
    // グラフの更新
    myChart.data.labels = annualDetails.map(detail => `Year ${detail.year}`);
    myChart.data.datasets[0].data = annualDetails.map(detail => detail.finalValue);
    myChart.data.datasets[1].data = annualDetails.map(detail => detail.totalInvestment);
    myChart.update();

    // テーブルの更新
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = ''; // 既存の行をクリア

    annualDetails.forEach(detail => {
        const row = tbody.insertRow();
        row.insertCell().textContent = detail.year;
        row.insertCell().textContent = detail.totalInvestment.toLocaleString();
        row.insertCell().textContent = detail.totalReturn.toLocaleString();
        row.insertCell().textContent = detail.finalValue.toLocaleString();
    });
}

// 仮の入力値でチャートとテーブルを更新する関数をエクスポート
// 実際にはフォーム入力から値を取得して呼び出す
export { updateChartAndTable };