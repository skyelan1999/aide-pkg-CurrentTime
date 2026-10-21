# 当前时间 · CurrentTime 1.1.0

独立Aide插件，MIT许可。提供主机时间、多时区对照、ISO周次查询，以及自包含的时间工作台。

## 工作台

在插件列表点击「时间工作台」。主时钟基准来自Aide主机，支持任意宿主可识别的IANA时区；常用时区包括Asia/Shanghai、UTC、Asia/Tokyo、Europe/London、America/New_York。实时显示由主机读数推算，每30秒重新查询校准，支持手动校准、时区切换和指定日期ISO周次查询。主机UTC时间、默认时区和最近校准状态可见，支持窄屏及宿主明暗主题。

工作台使用已有工具桥，不调用模型；关闭工作台或收到撤权事件后停止计时器和轮询。网络中断时显示校准失败并说明仍基于上次读数；不把浏览器本地时钟直接当成主机时间。

## Aide工具

- `get_current_datetime({timeZone?})`：保留date、time、timeZone、isoWeek、isoUtc、unixMs；新增runtimeTimeZone、clockSource和来源说明。默认是Aide主机时区，可指定IANA时区。
- `get_week_number({date?,timeZone?})`：严格YYYY-MM-DD，省略时计算所选时区今天；周一为开始，第一周为包含1月4日的周。返回weekYear、weekNumber、weekStart、weekEnd。

日期、时区显式传空、null或错误类型时明确报错，避免错误请求静默变成今天/默认时区。修复公元0001–0099年被Date.UTC当作1900年代处理的问题。

## 时间可信边界

来源是Aide运行环境系统时钟，不是浏览器墙上时钟，也不是SSH工作区设备时钟。本插件不提供NTP/天文授时，不保证系统时钟已校准；跨时区只转换同一瞬间。展示是近似实时读数，网络延迟、休眠和不同Intl时区数据版本可能影响显示，应以再次查询主机为准。

## 安装与验证

需要Node.js 18+及支持protocol 1工作台桥的Aide，市场兼容基线0.1.17.3 RC1。Windows/macOS/Linux与SSH工作区均可使用；实际验收为Linux，其他平台未实测。无npm运行依赖、无外部时间API；从本仓库Releases或Aide商店安装/升级ZIP。

```sh
node scripts/build.cjs
node scripts/verify.cjs
python3 scripts/package.py
```

工作台校验使用实际Aide ZIP安装与受控MessagePort桥，不需要真实模型。第三方桥代码说明见[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
