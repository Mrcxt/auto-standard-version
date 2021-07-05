# auto-check-version

## 简介

通过对`standard-version`二次封装，可视化操作，降低心智负担及出错率。
功能包括：

- 自动修改最新版本号
- 读取最新版本号，创建一个最新的git tag
- 根据提交信息，生成CHANGELOG.md
- 创建一个新提交包括 CHANGELOG.md和package.json
- ✨根据版本类型，自动控制 npm publish --tags以及自动提交git push tags(同时会自动提交至master分支)✨



## install

```bash
# 首先切换registry
npm config set registry http://npm.intra.xiaojukeji.com

yarn add -D @didi/auto-check-version
# or
npm i -D @didi/auto-check-version
```

## use

根目录新建`release.js`。
```js
const release = require("@didi/auto-check-version");

release();
```
or
```js
const release = require("@didi/auto-check-version");

async function main() {
  // 返回的方法均为异步操作
  const { publish, tags, confirm, run } = await release();

  // your code
  // await run("yarn", ["build"]);

  await publish(); // 发布npm,自动区分tags： latest/pre
  await tags(); // 执行tags操作 -> github/gitlab
}

main();
```

```bash
node release.js
```


## 关于版本

```
// 版本
major：主版本号，不兼容的API修改
minor：次版本号，向下兼容，功能性增加
patch：修订号，向下兼容，bug fixed

// 版本发布进度
alpha（内测）
beta（公测）
rc （正式版本的候选版本）
```