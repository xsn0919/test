// 模拟执行任务
async function dummyTask() {
  console.log("执行虚拟任务...");
  await new Promise(r => setTimeout(r, 100));
  return "done";
}

Deno.cron("quant-scheduler", "* * * * *", async () => {
  console.log("调度触发");
  const result = await dummyTask();
  console.log("任务完成:", result);
});

Deno.serve(() => new Response("OK"));
