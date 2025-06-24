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
    const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
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
  calculateAnnualDetails(monthlyInvestment, years, annualReturn) {
    const details = [];
    let totalInvestment = 0;
    let currentValue = 0;
    const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;

    for (let year = 1; year <= years; year++) {
      for (let i = 0; i < 12; i++) {
        totalInvestment += monthlyInvestment;
        currentValue = (currentValue + monthlyInvestment) * (1 + monthlyReturn);
      }
      details.push({
        year: year,
        totalInvestment: Math.round(totalInvestment),
        finalValue: Math.round(currentValue),
        totalReturn: Math.round(currentValue - totalInvestment)
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
 calculateMultiPeriod(initialPrincipal, periods) {
   let currentPrincipal = initialPrincipal;
   let totalInvestment = initialPrincipal; // 初期元本も積立総額に含める
   const annualData = [];
   let currentYear = 0; // シミュレーション開始からの経過年数

   periods.forEach(period => {
     const startAge = period.startAge;
     const duration = period.duration; // endAgeの代わりにdurationを使用
     const monthlyContribution = period.monthlyContribution; // monthlyContributionに変更
     const annualBonus = period.annualBonus;
     const rate = period.rate;
     const yearsInPeriod = duration; // 積立期間を直接使用
     if (yearsInPeriod <= 0) return; // 期間が不正な場合はスキップ

     for (let year = 0; year < yearsInPeriod; year++) {
       currentYear++;
       // 毎月積立額を年間積立額に変換して元本に追加
       currentPrincipal += (monthlyContribution * 12) + annualBonus;

       // 年間複利計算
       currentPrincipal = currentPrincipal * (1 + rate);
       
       totalInvestment += (monthlyContribution * 12) + annualBonus; // 積立総額に年間積立額とボーナスを追加

       annualData.push({
         year: currentYear,
         totalInvestment: Math.round(totalInvestment),
         finalValue: Math.round(currentPrincipal),
         totalReturn: Math.round(currentPrincipal - totalInvestment)
       });
     }
   });

   const finalValue = currentPrincipal;
   const totalReturn = finalValue - initialPrincipal; // 収益額は最終評価額から初期元本を引く
   const returnRate = (initialPrincipal > 0) ? (finalValue / initialPrincipal - 1) * 100 : 0; // 初期元本が0の場合は収益率も0

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