# 十四亿分之一 · 开发资料

- [SPEC.md](SPEC.md)：当前玩法、数据接口、状态键和验收要求。
- [baseline.json](baseline.json)、[after.json](after.json)：v2.1.0 数值校准前后的历史样本，保留原始数据，不代表当前版本。
- `validation/`：本地测试输出，已加入 Git 忽略；工具会按需创建。日志、截图和单次模拟结果不作为长期规范。

## 历史基线的口径

两份 JSON 均为八组策略，每组 80 世。旧验收说明记录的出生种子从 17001 起，按多数人／少数人选择，分别配阶段默认、持续工作、休息和锻炼重心。年龄、属性和净资产为中位数，`asked` 是每世平均停问数，`early` 指 60 岁前离世比例。

这些样本首先进入财富志向，不能代表所有志向的心愿达成率。`baseline.json` 没有学识分位、临终学识等后来增加的字段，不能补造缺失数据；原始文件未记录准确的代码提交，不能声称当前工具能逐字重现旧结果。

两份数据用于回顾当时的校准方向，不作为当前版本的固定通过门槛，也不要用当前运行结果覆盖它们。历史过程、调参记录和旧截图可从 Git 历史查找。

## 生成当前版本的对比

在仓库根目录执行，结果写入被忽略的目录：

```powershell
New-Item -ItemType Directory -Force 1in1.4b/docs/validation | Out-Null
node 1in1.4b/tools/compare.js 80 1in1.4b/docs/validation/current-compare.json
```

`compare.js` 的默认策略会先选固定志向。检查整体心愿达成率时，还需用 `COMPARE_STYLE=auto` 的真实自动选法，并查看输出里的 `wishByAim`；PowerShell 用 `$env:COMPARE_STYLE = 'auto'` 设置，结束后移除该环境变量。

提交新基线时，应另存带版本的文件，并记录提交、样本数、种子、策略、环境变量和统计口径。普通测试输出留在 `validation/`，无需提交。
