// presets.js

const presets = {
  default: {
    name: "サンプル：男性・年代別の年収中央値の10%積立",
    description:
      "年代の年収中央値の10%を月々積み立てた複利シミュレーション（5%年利）<br>毎月給与換算：20代	約30.0万円 / 30代	約38.5万円 / 40代 約45.8万円 / 50代 約50.0万円<br>※ボーナスを含めた年収を12で割った数値　※出典：<a href='https://doda.jp/guide/heikin/median/?utm_source=chatgpt.com' target='_blank'>doda</a><br>",
    principal: 0,
    periods: [
      {
        startAge: 20,
        duration: 10,
        monthlyContribution: 3,
        annualBonus: 0,
        rate: 0.05,
        timesCompounded: 12,
      },
      {
        startAge: 30,
        duration: 10,
        monthlyContribution: 3.85,
        annualBonus: 0,
        rate: 0.05,
        timesCompounded: 12,
      },
      {
        startAge: 40,
        duration: 10,
        monthlyContribution: 4.58,
        annualBonus: 0,
        rate: 0.05,
        timesCompounded: 12,
      },
      {
        startAge: 50,
        duration: 10,
        monthlyContribution: 5.,
        annualBonus: 0,
        rate: 0.05,
        timesCompounded: 12,
      },
    ],
    finalTotal: 23276814,
    logs: [
      {
        startAge: 20,
        endAge: 29,
        monthlyContribution: 23300.0,
        annualBonus: 0,
        rate: 0.05,
        durationYears: 10,
        totalAtEnd: 3618077,
      },
      {
        startAge: 30,
        endAge: 39,
        monthlyContribution: 33300.0,
        annualBonus: 0,
        rate: 0.05,
        durationYears: 10,
        totalAtEnd: 8788977,
      },
      {
        startAge: 40,
        endAge: 49,
        monthlyContribution: 43300.0,
        annualBonus: 0,
        rate: 0.05,
        durationYears: 10,
        totalAtEnd: 15512700,
      },
      {
        startAge: 50,
        endAge: 59,
        monthlyContribution: 50000.0,
        annualBonus: 0,
        rate: 0.05,
        timesCompounded: 12,
        totalAtEnd: 23276814,
      },
    ],
  },
};

// ES Modules形式でエクスポート
export default presets;

// CommonJS形式でのエクスポート（Node.js環境での互換性のため、必要であれば残す）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = presets;
}