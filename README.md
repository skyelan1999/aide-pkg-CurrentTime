# Current Time · Aide 当前日期时间

Aide `current-time` 插件的独立分发仓库，版本 **1.0.0**，MIT 许可。源码来自 [Aide 4dc9a7b0](https://github.com/skyelan1999/aide/tree/4dc9a7b0b01fef6ac3550b0b0fcf97db42d45f94/plugins/current-time)，运行代码及安装 ZIP 与已有市场 1.0.0 保持一致。

## 能力

| 工具 | 用途 |
| --- | --- |
| `get_current_datetime({timeZone?})` | 当前日期、时间、时区、UTC ISO 时间戳、Unix 毫秒时间及 ISO 周历 |
| `get_week_number({date?, timeZone?})` | 当前周或指定 `YYYY-MM-DD` 日期的 ISO 周数、周所属年份、周一与周日日期 |

两个工具均有可执行 handler，离线读取 **Aide 插件运行环境**的系统时钟，不访问网络、不读写项目文件、无需 npm 运行依赖。即使当前工作区通过 SSH 连接，读取的仍是 Aide Node 运行环境时钟，不是远程设备时钟。

省略 `timeZone` 时使用 Aide 容器/进程的默认时区，不能据此假设为用户浏览器时区。可传入 `Asia/Shanghai`、`UTC` 等 IANA 时区；`isoUtc` 始终为 UTC。时钟准确度取决于运行环境自身的校时，插件不执行 NTP 校时。

ISO-8601 周从星期一开始，第 1 周包含 1 月 4 日，因此公历年初可能属于上一周历年。例如：

```json
{"date":"2021-01-01","weekYear":2020,"weekNumber":53,"weekStart":"2020-12-28","weekEnd":"2021-01-03","standard":"ISO-8601"}
```

无效时区或日期会返回错误。Aide 可通过普通插件工具机制调用；小秘的时间工具白名单支持需由宿主提供，禁用工具仍沿用宿主权限检查。此插件没有独立 UI 或工作台。

## 安装

需要支持插件导入的 Aide（市场兼容基线 `0.1.17.0 RC2`）及 Node.js 插件运行环境。平台声明为 Windows、macOS 和 Linux；本次实际验证环境为 Linux，未实测 Windows/macOS。

从 [v1.0.0 Release](https://github.com/skyelan1999/aide-pkg-CurrentTime/releases/tag/v1.0.0) 说明中的固定提交链接下载 `aide-pkg-CurrentTime-v1.0.0.zip` 和 `SHA256SUMS`，校验后通过 Aide 插件管理导入；也可在[官方插件市场](https://skyelan1999.github.io/aide-pkg-shop/)搜索 `current-time`。

```sh
sha256sum -c SHA256SUMS
```

已安装同 ID、同版本插件的用户无需重复安装。ZIP 保留原包的 `LICENSE`、`index.js`、`manifest.json` 和 `test.js`，不重新打包。安装包托管于仓库 `packages/v1.0.0/`，Release 提供固定提交下载链接，没有另行上传二进制附件。市场分发相同字节。

## 验证

```sh
node --check index.js
node scripts/verify.cjs
```

验证脚本在临时目录中提供原测试需要的最小插件注册表，运行未修改的 `test.js`；这覆盖实际时钟、指定时区、周历跨年与无效参数，不等于完整 Aide 应用验收。发布时另用 Aide 原生插件宿主验证入口、工具 surface、实际调用，以及 Aide/小秘工具权限回归。精确结果见 `docs/release-verification.json`。

SHA-256 用于安装包完整性检查，不是发布者签名；可信 Node 插件机制不是权限沙箱。
