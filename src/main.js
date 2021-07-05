const { red, green } = require("chalk");
const { valid } = require("semver");
const { prompt } = require("enquirer");

const {
  currentVersion,
  run,
  step,
  isPre,
  confirm,
  inc,
} = require("./util/index");

//
async function main() {
  const { stdout } = await run("git", ["status", "-s"], {});
  stdout &&
    (console.log(
      red("请确保工作区是干净的，以避免npm包与tags仓库不一致的情况出现")
    ) ||
      (await confirm({
        message: "当前git工作区有未提交的文件，是否继续版本升级？",
        initial: false,
      })));

  console.log(green(`\n当前版本号为：${currentVersion}\n`));

  let prerelease, targetVersion;
  const { release } = await prompt({
    type: "select",
    name: "release",
    message: "请选择版本号升级类型",
    choices: ["prerelease", "patch", "minor", "major"]
      .map((i) => ({
        name: i,
        value: i,
        message: `${i} (${isPre(i) ? "预发布 alpha/beta/rc" : inc(i)})`,
      }))
      .concat([
        {
          name: "custom",
          value: "custom",
          message: "自定义版本号",
        },
      ]),
  });

  if (release === "prerelease") {
    prerelease = (
      await prompt({
        type: "select",
        name: "prerelease",
        message: "请选择预发布进度",
        choices: ["alpha", "beta", "rc"].map((i) => ({
          name: i,
          value: i,
          message: `${i} (${inc("prerelease", i)})`,
        })),
      })
    ).prerelease;
  }

  targetVersion = inc(release, prerelease);

  if (release === "custom") {
    targetVersion = (
      await prompt({
        type: "input",
        name: "version",
        message: "请填写自定义版本号",
        initial: inc("prerelease"),
      })
    ).version;
  }

  if (!valid(targetVersion)) {
    throw new Error(red(`版本号不符合规范: ${targetVersion}`));
  }

  await confirm({
    message: `确认将版本号升级至 v${targetVersion}?`,
  });

  // Update the package version.
  step("\nUpdating the package version...");
  const updateOrder = prerelease
    ? ["-p", prerelease]
    : ["-r", release === "custom" ? "targetVersion" : release];
  await run("standard-version", updateOrder);

  // Publish the package.
  const publish = async () => {
    let tags;
    tags = (
      await prompt({
        type: "select",
        name: "tags",
        message: "请选择publish tags",
        choices: [
          {
            name: "alpha",
            message: "内测版本",
          },
          {
            name: "beta",
            message: "公测版本",
          },
          {
            name: "rc",
            message: "候选版本",
          },
          {
            name: "latest",
            message: "默认版本",
          },
        ]
          .map(({ name, message }) => ({
            name,
            value: name,
            message: `${name} (${message})`,
          }))
          .concat([
            {
              name: "custom",
              message: "自定义版本",
            },
          ]),
      })
    ).tags;

    if (tags === "custom") {
      tags = (
        await prompt({
          type: "input",
          name: "tags",
          message: "请填写自定义tags",
          initial: prerelease || "next",
        })
      ).tags;
    }
    step("\nPublishing the package...");
    await run("npm", ["publish", "--tag", `${tags}`]);
  };

  // Push tags to GitHub.
  const tags = async () => {
    step("\nPushing tags to GitHub...");
    await run("git", ["push", "origin", "--tags"]);
    console.log(green("\n please run 'git push <remote> <branch>' \n"));
  };

  return Promise.resolve({
    publish,
    tags,
    confirm,
    run,
  });
}

module.exports = () =>
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
