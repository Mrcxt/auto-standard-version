const release = require("./src/main.js");

async function main() {
  // 返回的方法均为异步操作
  const { publish, tags, confirm, run } = await release();

  // your code
  // await run("yarn", ["build"]);

  await publish(); // 发布npm,自动区分tags： latest/pre
  await tags(); // 执行tags操作 -> github/gitlab
}

main();
