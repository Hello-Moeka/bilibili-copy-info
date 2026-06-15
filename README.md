# B站动态一键复制关键信息

Tampermonkey 用户脚本，在 [B站动态页](https://t.bilibili.com/?tab=video) 视频投稿卡片右下角注入复制按钮，一键复制主播名、UID、BV号。

## 功能

- 自动识别动态中的视频投稿
- 于视频卡片右下角显示「复制」按钮
- 点击后复制格式：`主播名`<kbd>Tab</kbd>`UID`<kbd>Tab</kbd><kbd>Tab</kbd>`BV号`
- 支持无限滚动，新加载内容自动追加按钮

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 打开 [bilibili-copy-info.user.js](./bilibili-copy-info.user.js)
3. 点击 **Raw** → Tampermonkey 会自动弹出安装窗口 → 点击 **安装**

## 使用

访问 https://t.bilibili.com/?tab=video ，每个视频投稿卡片的右下角会出现「复制」按钮，点击即可。

## 许可证

MIT
