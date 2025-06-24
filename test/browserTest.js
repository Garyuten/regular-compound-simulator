const puppeteer = require('puppeteer');
const assert = require('assert'); // Node.jsのassertモジュールを使用

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // ヘッドレスモードを無効にしてブラウザを表示
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // コンソールエラーを監視
    let hasConsoleErrors = false;
    page.on('console', msg => {
        if (msg.type() === 'error') {
            // 404エラーは無視する
            if (!msg.text().includes('404 (Not Found)')) {
                console.error('Console error:', msg.text());
                hasConsoleErrors = true;
            }
        } else {
            // console.log('Console log:', msg.text());
        }
    });

    await page.goto('http://localhost:5500/index.html', { waitUntil: 'networkidle0' });
    console.log('Page loaded');

    // LocalStorageをクリア
    await page.evaluate(() => localStorage.clear());
    console.log('LocalStorage cleared');

    // LocalStorageをクリア
    await page.evaluate(() => localStorage.clear());
    console.log('LocalStorage cleared');

    // プリセット選択ドロップダウンが表示されるまで待機
    await page.waitForSelector('#presetSelect', { timeout: 30000 });
    console.log('Preset select is visible.');

    // window.appPresetsが定義されるまで待機
    await page.waitForFunction(() => window.appPresets !== undefined, { timeout: 30000 });
    console.log('window.appPresets is defined');

    // 初期元本入力フィールドが表示されるまで待機
    await page.waitForSelector('#principal', { timeout: 30000 });
    console.log('Principal input is visible.');

    // 期間テーブルの最初の行が表示されるまで待機
    await page.waitForSelector('#periodsTable tbody tr:first-child', { timeout: 30000 });
    console.log('Periods table first row is visible.');

    // 結果テーブルの最終行が表示されるまで待機
    await page.waitForSelector('#resultsTable tbody tr:last-child td:nth-child(4)', { timeout: 30000 });
    console.log('Results table final value is visible.');

    // --- 単体テスト ---

    // 1. プリセットデータのテスト (データ構造の検証)
    console.log('\n--- 単体テスト: プリセットデータ ---');
    // window.appPresetsが定義されるまで待機
    await page.waitForFunction(() => window.appPresets !== undefined, { timeout: 30000 });
    const presets = await page.evaluate(() => {
        return window.appPresets;
    });

    try {
        assert.ok(presets, 'プリセットデータが存在しません');
        assert.ok(presets.default && presets.default.periods, 'デフォルトプリセットのデータ構造が不正です');
        assert.ok(presets.newGraduate22_24 && presets.newGraduate22_24.periods.length > 0, '新卒プリセットのデータ構造が不正です');
        console.log('プリセットデータの構造検証: OK');
    } catch (error) {
        console.error('プリセットデータの構造検証: FAILED', error.message);
        hasConsoleErrors = true;
    }

    // 2. 期間設定機能のテスト (期間の追加/削除)
    console.log('\n--- 単体テスト: 期間設定機能 ---');
    try {
        // 期間テーブルの最初の行が表示されるまで待機
        await page.waitForSelector('#periodsTable tbody tr:first-child', { timeout: 30000 });

        // 初期期間数を取得 (最後の空行を除く)
        const initialPeriodCount = await page.evaluate(() => {
            const rows = document.querySelectorAll('#periodsTable tbody tr');
            return Array.from(rows).filter(row => {
                // 最後の空行は無視
                const inputs = row.querySelectorAll('input[type="number"]');
                return Array.from(inputs).some(input => input.value !== '');
            }).length;
        });
        console.log(`初期期間数: ${initialPeriodCount}`);

        // 期間を追加 (最後の空行に何か入力することで新しい期間が追加される)
        // 最後の行の最初の入力フィールドに値を入力
        await page.type(`#periodsTable tbody tr:last-child td:nth-child(1) input`, '20');
        await page.keyboard.press('Enter'); // changeイベントをトリガー

        // 新しい期間がレンダリングされるまで待機 (行数が増えることを確認)
        // 新しい期間の行の最初の入力フィールドが表示されるまで待機
        await page.waitForSelector(`#periodsTable tbody tr:nth-child(${initialPeriodCount + 1}) td:nth-child(1) input`, { timeout: 30000 });
        await page.waitForFunction(count => document.querySelectorAll('#periodsTable tbody tr').length === count, {}, initialPeriodCount + 2, { timeout: 30000 }); // 既存の期間 + 新しい期間 + 空行

        const afterAddPeriodCount = await page.evaluate(() => {
            const rows = document.querySelectorAll('#periodsTable tbody tr');
            return Array.from(rows).filter(row => {
                const inputs = row.querySelectorAll('input[type="number"]');
                return Array.from(inputs).some(input => input.value !== '');
            }).length;
        });
        assert.strictEqual(afterAddPeriodCount, initialPeriodCount + 1, '期間の追加が正しくありません');
        console.log('期間の追加: OK');

        // 期間を削除
        // 追加した期間の削除ボタンをクリック (新しい期間は最後から2番目の行になる)
        await page.click(`#periodsTable tbody tr:nth-child(${initialPeriodCount + 1}) .remove-period`);
        await page.waitForFunction(count => {
            const rows = document.querySelectorAll('#periodsTable tbody tr');
            return Array.from(rows).filter(row => {
                const inputs = row.querySelectorAll('input[type="number"]');
                return Array.from(inputs).some(input => input.value !== '');
            }).length === count;
        }, {}, initialPeriodCount);
        const afterRemovePeriodCount = await page.evaluate(() => {
            const rows = document.querySelectorAll('#periodsTable tbody tr');
            return Array.from(rows).filter(row => {
                const inputs = row.querySelectorAll('input[type="number"]');
                return Array.from(inputs).some(input => input.value !== '');
            }).length;
        });
        assert.strictEqual(afterRemovePeriodCount, initialPeriodCount, '期間の削除が正しくありません');
        console.log('期間の削除: OK');
    } catch (error) {
        console.error('期間設定機能のテスト: FAILED', error.message);
        hasConsoleErrors = true;
    }

    // --- 結合テスト ---

    // 1. プリセット選択とフォーム更新
    console.log('\n--- 結合テスト: プリセット選択とフォーム更新 ---');
    try {
        await page.select('#presetSelect', 'newGraduate22_24');
        // プリセット選択後、最初の期間の年間積立額が更新されるまで待機
        await page.waitForFunction(() => document.querySelector('#periodsTable tbody tr:first-child td:nth-child(3) input').value === '60000', { timeout: 30000 });

        const principalValue = await page.$eval('#principal', el => parseFloat(el.value));
        const firstPeriodAnnualContribution = await page.$eval('#periodsTable tbody tr:first-child td:nth-child(3) input', el => parseFloat(el.value));

        assert.strictEqual(principalValue, 0, 'プリセット選択後の初期元本が正しくありません');
        assert.strictEqual(firstPeriodAnnualContribution, 60000, 'プリセット選択後の年間積立額が正しくありません');
        console.log('プリセット選択とフォーム更新: OK');
    } catch (error) {
        console.error('プリセット選択とフォーム更新: FAILED', error.message);
        hasConsoleErrors = true;
    }

    // 2. カスタム設定時の計算
    console.log('\n--- 結合テスト: カスタム設定時の計算 ---');
    try {
        // カスタム値を入力
        await page.select('#presetSelect', 'default');
        // デフォルト値に戻るのを待機
        await page.waitForFunction(() => document.querySelector('#periodsTable tbody tr:first-child td:nth-child(3) input').value === '120000', { timeout: 30000 });

        await page.focus('#principal');
        await page.keyboard.down('Shift');
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Backspace');
        }
        await page.keyboard.up('Shift');
        await page.type('#principal', '5000');
        
        await page.focus('#periodsTable tbody tr:first-child td:nth-child(3) input');
        await page.keyboard.down('Shift');
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Backspace');
        }
        await page.keyboard.up('Shift');
        await page.type('#periodsTable tbody tr:first-child td:nth-child(3) input', '10000');
        
        await page.click('button[type="submit"]');
        // 結果テーブルの最終行が表示されるまで待機
        await page.waitForSelector('#resultsTable tbody tr:last-child td:nth-child(4)', { timeout: 30000 });

        // 最終評価額がUIに表示されていることを確認する
        const finalValueElement = await page.$('#resultsTable tbody tr:last-child td:nth-child(4)');
        assert.ok(finalValueElement, '最終評価額の要素が見つかりません');
        const finalValueText = await page.evaluate(el => el.textContent, finalValueElement);
        assert.ok(finalValueText.length > 0, '最終評価額が空です');
        console.log(`最終評価額 (UIから取得): ${finalValueText}`);
        console.log('カスタム設定時の計算: OK');
    } catch (error) {
        console.error('カスタム設定時の計算: FAILED', error.message);
        hasConsoleErrors = true;
    }

    // 最終的なコンソールエラーチェック
    if (hasConsoleErrors) {
        console.log('\nテスト結果: 失敗 (コンソールエラーまたはアサーション失敗)');
    } else {
        console.log('\nテスト結果: 成功 (コンソールエラーなし、全てのアサーションがパス)');
    }

    await browser.close();
})();