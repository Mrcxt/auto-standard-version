const path = require("path");
const execa = require("execa");
const chalk = require("chalk");
const { prompt } = require("enquirer");
const semver = require("semver");

//
const currentVersion = require(path.resolve(process.cwd(), "package.json"))
  .version;

//
const run = (
  bin,
  args,
  opts = {
    stdio: "inherit",
  }
) => {
  const cmd = execa(bin, args, opts);
  console.log(chalk.yellow(cmd.spawnargs.join(" ")));
  return cmd.catch((err) => {
    console.log(err);
    process.exit(1);
  });
};

//
const step = (msg) => console.log(chalk.cyan(msg));

//
const isPre = (release) =>
  ["prerelease", "prepatch", "preminor", "premajor"].includes(release);

/**
 * @description:
 * @param {String} message 确认文本
 * @param {Boolean} initial 默认选择 true or false
 * @param {Boolean} exit 选择false之后是否终止后续脚本，默认 true
 * @return {*}
 */
const confirm = async ({ message, initial = true, exit = true }) => {
  const { value } = await prompt({
    type: "confirm",
    name: "value",
    message,
    initial,
  });

  if (!value && exit) {
    process.exit(0);
  }

  return value;
};

//
const inc = (i, tag) => semver.inc(currentVersion, i, tag);

module.exports = {
  currentVersion,
  run,
  step,
  isPre,
  confirm,
  inc,
};
