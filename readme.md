### 简介
CSVX 是一个简单易用的 CSV 解析器

### 安装
```sh
npm install csvx -save
```

### 将 object 转换为 csv
```js
var CSV = require("csvx");
var csv = new CSV({
	hasTitle:true
});
var csvObject = {...}
var csvText = csv.stringify(csvObject);
```

### 将 csv 转换为 object
```js
var CSV = require("csvx");
var csv = new CSV({
	hasTitle:true
});
var csvText = "...."
var csvObject = csv.parse(csvText);
```