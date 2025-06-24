import { calculateAndDisplayResults, formatWithCommas } from './calculatorDisplay.js';
let activeCellInput = null;
const periodsContainer = document.getElementById('periodsContainer');
import { currentPeriods } from './settingsManager.js';

console.log('Rendering periods with currentPeriods:', currentPeriods);
function renderPeriods() {
    periodsContainer.innerHTML = '';
    const periodsToRender = currentPeriods.length > 0 ? [...currentPeriods] : [{
        startAge: '',
        monthlyContribution: '',
        annualBonus: ''
    }];
    periodsToRender.push({
        startAge: '',
        monthlyContribution: '',
        annualBonus: ''
    });

    periodsToRender.forEach((period, index) => {
        const row = periodsContainer.insertRow();
        row.setAttribute('role', 'row');
        // ログ追加: 各periodの値を出力
        console.log(`renderPeriods: index=${index}`, period);
        row.innerHTML = `
            <td role="cell" class="border border-gray-300 p-0 text-center align-middle border-none bg-transparent">
                ${index < currentPeriods.length ? `<button type="button" class="remove-period bg-transparent text-gray-600 border-none p-1 text-lg cursor-pointer transition-colors duration-200 w-auto h-auto leading-none inline-block m-0 rounded-none hover:text-red-600" data-index="${index}" title="削除">✕</button>` : ''}
            </td>
            <td role="cell" class="w-24 p-4 border border-gray-300 p-0 text-center align-middle">
              <input type="number" value="${period.startAge ?? ''}" data-index="${index}" data-field="startAge" min="0" aria-label="開始年齢"
                class="w-full p-0 border-none bg-transparent text-2xl font-bold text-right rounded-none focus:outline-none" placeholder="">
            </td>
            <td role="cell" class="w-32 p-4 border border-gray-300 p-0 text-center align-middle">
              <input type="number" value="${period.monthlyContribution ?? ''}" data-index="${index}" data-field="monthlyContribution" min="0" aria-label="毎月積立額"
                class="w-full p-0 border-none bg-transparent text-2xl font-bold text-right rounded-none focus:outline-none" placeholder="">
            </td>
            <td role="cell" class="w-32 p-4 border border-gray-300 p-0 text-center align-middle">
              <input type="number" value="${period.annualBonus ?? ''}" data-index="${index}" data-field="annualBonus" min="0" aria-label="年間ボーナス"
                class="w-full p-0 border-none bg-transparent text-2xl font-bold text-right rounded-none focus:outline-none" placeholder="">
            </td>
        `;
    });

    addPeriodEventListeners();
    setupKeyboardNavigation();
}

function addPeriodEventListeners() {
    periodsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', (event) => {
            if (activeCellInput) {
                activeCellInput.closest('td').classList.remove('focused');
            }
            activeCellInput = event.target;
            activeCellInput.closest('td').classList.add('focused');
        });

        // 金額欄のカンマ区切り自動挿入は不要になったため削除

        input.addEventListener('blur', (event) => {
            if (activeCellInput && activeCellInput === event.target) {
                activeCellInput.closest('td').classList.remove('focused');
                activeCellInput = null;
            }
        });

        // 入力・変更時に値更新＋計算
        const handleInputChange = (event) => {
            const index = parseInt(event.target.dataset.index);
            const field = event.target.dataset.field;
            // カンマ除去して値を取得
            let value = event.target.value.replace(/,/g, '').trim();

            if (value === '') {
                value = null;
            } else {
                value = parseFloat(value);
                if (field === 'rate') {
                    value = value / 100;
                }
            }

            if (index === currentPeriods.length) {
                if (value !== null) {
                    const newPeriod = {
                        startAge: null,
                        monthlyContribution: null,
                        annualBonus: null
                    };
                    newPeriod[field] = value;
                    currentPeriods.push(newPeriod);
                    renderPeriods();
                }
            } else {
                currentPeriods[index][field] = value;
            }
            calculateAndDisplayResults();
        };
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', handleInputChange);
    });

    periodsContainer.querySelectorAll('.remove-period').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = parseInt(event.target.dataset.index);
            currentPeriods.splice(index, 1);
            renderPeriods();
            // 行削除時も再計算
            import('./calculatorDisplay.js').then(module => {
                module.calculateAndDisplayResults();
            });
        });
    });
}

function setupKeyboardNavigation() {
    periodsContainer.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target.tagName === 'INPUT' && target.closest('#periodsContainer')) {
            const inputs = Array.from(periodsContainer.querySelectorAll('input'));
            const currentIndex = inputs.indexOf(target);
            let nextInput = null;

            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    const currentField = target.dataset.field;
let activeCellInput = null;
                    const fields = ['startAge', 'monthlyContribution', 'annualBonus'];
                    const currentFieldIndex = fields.indexOf(currentField);
                    const currentRowIndex = parseInt(target.dataset.index);

                    if (currentFieldIndex < fields.length - 1) {
                        nextInput = inputs[currentIndex + 1];
                    } else {
                        nextInput = periodsContainer.querySelector(`tr[data-row-index="${currentRowIndex + 1}"] input[data-field="startAge"]`);
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

export { renderPeriods, currentPeriods };