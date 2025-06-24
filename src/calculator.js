/**
 * 複利計算シミュレーションを行うクラス
 */
class CompoundCalculator {
  /**
   * 定期積立の複利計算を行う
   * @param {number} monthlyInvestment - 毎月の積立金額
   * @param {number} years - 運用年数
   * @param {number} annualReturn - 年間期待収益率（小数）
   * @returns {object} 計算結果
   */
  calculate(monthlyInvestment, years, annualReturn) {
    const months = years * 12;
    const monthlyReturn = Math.floor((annualReturn / 12) * 1000) / 1000;
    let totalInvestment = 0;
    let currentValue = 0;

    for (let i = 0; i < months; i++) {
      totalInvestment += monthlyInvestment;
      currentValue = (currentValue + monthlyInvestment) * (1 + monthlyReturn);
    }

    return {
      totalInvestment: Math.round(totalInvestment),
      finalValue: Math.round(currentValue),
      totalReturn: Math.round(currentValue - totalInvestment),
      returnRate: (currentValue / totalInvestment - 1) * 100
    };
  }

  /**
   * 年ごとの詳細な複利計算結果を返す
   * @param {number} monthlyInvestment - 毎月の積立金額
   * @param {number} years - 運用年数
   * @param {number} annualReturn - 年間期待収益率（小数）
   * @returns {Array<object>} 各年の計算結果の配列
   */
  /**
   * 年ごとの詳細な複利計算結果を返す（各月積立ごとに残り月数分の複利を乗算して年末合算）
   * @param {number} monthlyInvestment - 毎月の積立金額
   * @param {number} years - 運用年数
   * @param {number} annualReturn - 年間期待収益率（小数）
   * @param {number} startAge - 開始年齢
   * @returns {Array<object>} 各年の計算結果の配列
   */
  calculateAnnualDetails(monthlyInvestment, years, annualReturn, startAge = 20) {
    const details = [];
    const monthlyRate = annualReturn / 12;
    let totalInvestment = 0;
    let currentValue = 0;

    for (let year = 0; year < years; year++) {
      let yearStartValue = currentValue;
      let yearInterest = 0;

      for (let month = 0; month < 12; month++) {
        totalInvestment += monthlyInvestment;
        // 利息は積立後に付与（期末型）
        currentValue += monthlyInvestment;
        const interest = currentValue * monthlyRate;
        currentValue += interest;
        yearInterest += interest;
      }

      details.push({
        year: startAge + year,
        totalInvestment: totalInvestment,
        totalReturn: Math.round(currentValue - totalInvestment),
        finalValue: Math.round(currentValue),
        yearInterest: Math.round(yearInterest)
      });
    }
    return details;
  }
 /**
  * 複数期間にわたる複利計算を行う
  * @param {number} initialPrincipal - 初期元本
  * @param {Array<object>} periods - 期間設定の配列
  * @returns {object} 計算結果と年間推移データ
  */
 calculateMultiPeriod(initialPrincipal, periods, globalRate, globalEndAge) {
   let totalInvestment = initialPrincipal;
   let currentValue = initialPrincipal;
   const annualData = [];

   // periodsを開始年齢順にソート
   const sortedPeriods = [...periods].sort((a, b) => a.startAge - b.startAge);

   let currentAge = sortedPeriods.length > 0 ? parseInt(sortedPeriods[0].startAge, 10) : 0;
   let periodIdx = 0;
   const monthlyRate = globalRate / 12;

   for (let year = currentAge; year <= globalEndAge; year++) {
     // 現在のperiodを取得
     while (
       periodIdx < sortedPeriods.length - 1 &&
       year >= parseInt(sortedPeriods[periodIdx + 1].startAge, 10)
     ) {
       periodIdx++;
     }
     const period = sortedPeriods[periodIdx];
     const monthlyContribution = parseFloat(period.monthlyContribution) || 0;
     const annualBonus = parseFloat(period.annualBonus) || 0;

     let yearInterest = 0;
     for (let m = 0; m < 12; m++) {
       // 毎月積立
       currentValue += monthlyContribution;
       totalInvestment += monthlyContribution;
       // ボーナスは1月に加算（必要なら他月に変更可）
       if (annualBonus && m === 0) {
         currentValue += annualBonus;
         totalInvestment += annualBonus;
       }
       // 利息付与
       const interest = currentValue * monthlyRate;
       currentValue += interest;
       yearInterest += interest;
     }

     annualData.push({
       year: year,
       totalInvestment: Math.round(totalInvestment),
       finalValue: Math.round(currentValue),
       totalReturn: Math.round(currentValue - totalInvestment),
       yearInterest: Math.round(yearInterest)
     });
   }

   const finalValue = currentValue;
   const totalReturn = finalValue - totalInvestment;
   const returnRate = (totalInvestment > 0) ? (finalValue / totalInvestment - 1) * 100 : 0;

   return {
     annualData,
     totalInvestment: Math.round(totalInvestment),
     finalValue: Math.round(finalValue),
     totalReturn: Math.round(totalReturn),
     returnRate: returnRate
   };
 }

 /**
  * バックテストシミュレーションを行う
  * @param {Array<number>} historicalReturns - 過去の年間収益率の配列（小数）
  * @param {number} monthlyInvestment - 毎月の積立金額
  * @returns {object} 計算結果
  */
 backtest(historicalReturns, monthlyInvestment) {
   let totalInvestment = 0;
   let currentValue = 0;

   historicalReturns.forEach(annualReturn => {
     const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
     for (let i = 0; i < 12; i++) {
       totalInvestment += monthlyInvestment;
       currentValue = (currentValue + monthlyInvestment) * (1 + monthlyReturn);
     }
   });

   return {
     totalInvestment: Math.round(totalInvestment),
     finalValue: Math.round(currentValue),
     totalReturn: Math.round(currentValue - totalInvestment),
     returnRate: (currentValue / totalInvestment - 1) * 100
   };
 }
}

export default CompoundCalculator;