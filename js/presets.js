// presets.js

const presets = {
    default: {
        name: "デフォルト",
        description: "一般的な積立シミュレーション",
        periods: [
            {
                startAge: 20,
                endAge: 60,
                annualContribution: 120000, // 月1万円
                annualBonus: 0,
                rate: 0.05,
                timesCompounded: 12
            }
        ]
    },
    highInterest: {
        name: "高金利",
        description: "高金利での積立シミュレーション",
        periods: [
            {
                startAge: 20,
                endAge: 60,
                annualContribution: 120000,
                annualBonus: 0,
                rate: 0.1,
                timesCompounded: 12
            }
        ]
    },
    newGraduate22_24: {
        name: "新卒 (22-24歳)",
        description: "新卒1〜3年目の積立シミュレーション",
        periods: [
            {
                startAge: 22,
                endAge: 24,
                annualContribution: 60000, // 月5千円
                annualBonus: 0,
                rate: 0.03,
                timesCompounded: 12
            },
            {
                startAge: 25,
                endAge: 60,
                annualContribution: 120000, // 月1万円
                annualBonus: 0,
                rate: 0.03,
                timesCompounded: 12
            }
        ]
    },
    newGraduate25_29: {
        name: "新卒 (25-29歳)",
        description: "新卒4〜8年目の積立シミュレーション",
        periods: [
            {
                startAge: 25,
                endAge: 29,
                annualContribution: 120000, // 月1万円
                annualBonus: 0,
                rate: 0.04,
                timesCompounded: 12
            },
            {
                startAge: 30,
                endAge: 60,
                annualContribution: 240000, // 月2万円
                annualBonus: 0,
                rate: 0.04,
                timesCompounded: 12
            }
        ]
    },
    newGraduate30Plus: {
        name: "新卒 (30歳以降)",
        description: "新卒9年目以降の積立シミュレーション",
        periods: [
            {
                startAge: 30,
                endAge: 60,
                annualContribution: 360000, // 月3万円
                annualBonus: 0,
                rate: 0.05,
                timesCompounded: 12
            }
        ]
    },
    studentLoan: {
        name: "学生 (奨学金返済考慮)",
        description: "奨学金返済を考慮した学生の積立シミュレーション",
        periods: [
            {
                startAge: 18,
                endAge: 22,
                annualContribution: 12000, // 月1千円
                annualBonus: 0,
                rate: 0.01,
                timesCompounded: 12
            },
            {
                startAge: 23,
                endAge: 27, // 奨学金返済期間
                annualContribution: 60000, // 月5千円
                annualBonus: 0,
                rate: 0.03,
                timesCompounded: 12
            },
            {
                startAge: 28,
                endAge: 60,
                annualContribution: 120000, // 月1万円
                annualBonus: 0,
                rate: 0.04,
                timesCompounded: 12
            }
        ]
    },
    careerChange: {
        name: "社会人転職",
        description: "転職後の積立シミュレーション",
        periods: [
            {
                startAge: 25,
                endAge: 29, // 転職直後
                annualContribution: 60000, // 月5千円
                annualBonus: 0,
                rate: 0.03,
                timesCompounded: 12
            },
            {
                startAge: 30,
                endAge: 60,
                annualContribution: 180000, // 月1.5万円
                annualBonus: 0,
                rate: 0.04,
                timesCompounded: 12
            }
        ]
    },
    familyPlanning: {
        name: "家族計画",
        description: "家族計画を考慮した積立シミュレーション",
        periods: [
            {
                startAge: 30,
                endAge: 35, // 子育て初期
                annualContribution: 60000, // 月5千円
                annualBonus: 0,
                rate: 0.03,
                timesCompounded: 12
            },
            {
                startAge: 36,
                endAge: 45, // 子育て中期
                annualContribution: 120000, // 月1万円
                annualBonus: 0,
                rate: 0.04,
                timesCompounded: 12
            },
            {
                startAge: 46,
                endAge: 60, // 子育て後期〜老後
                annualContribution: 240000, // 月2万円
                annualBonus: 0,
                rate: 0.05,
                timesCompounded: 12
            }
        ]
    },
    retirementPlanning: {
        name: "老後資金計画",
        description: "老後資金のための積立シミュレーション",
        periods: [
            {
                startAge: 40,
                endAge: 60,
                annualContribution: 360000, // 月3万円
                annualBonus: 100000, // 年間ボーナス10万円
                rate: 0.04,
                timesCompounded: 12
            }
        ]
    }
};

// ES Modules形式でエクスポート
export default presets;

// CommonJS形式でのエクスポート（Node.js環境での互換性のため、必要であれば残す）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = presets;
}