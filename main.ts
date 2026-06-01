import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// --- 配置区域 (请替换为你的实际值) ---
// 从环境变量中读取密钥，确保安全。请在 Deno Deploy 控制台中配置它。
const CRON_SECRET_KEY = Deno.env.get("CRON_SECRET_KEY") || "YOUR_KEY_HERE";
const SCHEDULER_URL = `https://quant.ccccocccc.cc/scheduler_cronjob.php?key=${CRON_SECRET_KEY}&force=1`;

// --- 核心逻辑 ---
async function runScheduler() {
    console.log(`[${new Date().toISOString()}] 调度器开始执行`);
    let browser;
    try {
        // 启动浏览器，这些参数是让 Puppeteer 在 Deno Deploy 的受限环境中稳定运行的关键
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        // 访问你的 PHP 文件，等待网络空闲，确保 JS 挑战完成
        await page.goto(SCHEDULER_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        const body = await page.evaluate(() => document.body.innerText);
        console.log(`调度器响应状态: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);
    } catch (error) {
        console.error("调度器执行失败:", error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// --- Cron 调度与健康检查 ---
Deno.cron("quant-scheduler", "* * * * *", async () => {
    await runScheduler();
});

// 这个是 Deno Deploy 的健康检查端点，必须存在，保持应用活跃
Deno.serve(() => new Response("OK"));
