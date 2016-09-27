### 简介
CSVX 是一个简单易用的 CSV 解析器

### 安装
```sh
npm install csvx -save
```

### 将 array 转换为 csv
```js
var csv = require("csvx");
var text = csv.stringify(array);
```

### 将 csv 转换为 array
```js
var csv = require("csvx");
var array = csv.parse(text);
```

### 用例
```js
var csv = require('../');
var assert = require('assert');

describe('csv', function () {

  describe('stringify()', function () {

    it('default', function () {
      var text = csv.stringify([
        { name: 'zs', age: 20 },
        { name: 'ls', age: 21 }
      ]);
      assert.equal(text, '"zs",20\n"ls",21');
    });

    it('headline', function () {
      var text = csv.stringify([
        { name: 'zs', age: 20 },
        { name: 'ls', age: 21 }
      ], true);
      assert.equal(text, 'name,age\n"zs",20\n"ls",21');
    });

    it('columns', function () {
      var text = csv.stringify([
        { name: 'z,s', age: 20 },
        { name: 'ls', age: 21 }
      ], true, [
          { name: 'name', displayName: '姓名' },
          { name: 'age', displayName: '年龄' }
        ]);
      assert.equal(text, '姓名,年龄\n"z,s",20\n"ls",21');
    });

  });

  describe('parse()', function () {

    it('default', function () {
      var list = csv.parse('zs,20\nls,21');
      assert.deepEqual(list, [['zs', '20'], ['ls', '21']]);
    });

    it('headline', function () {
      var list = csv.parse('姓名,年龄\n"z,\\"s",20\nls,21', true);
      assert.deepEqual(list, [{ '姓名': 'z,\\"s', '年龄': 20 }, { '姓名': 'ls', '年龄': 21 }]);
    });

    it('columns', function () {
      var list = csv.parse('"z,\\"s",20\nls,21', false, [
        { name: 'name' },
        { name: 'age' }
      ]);
      assert.deepEqual(list, [{ name: 'z,\\"s', age: 20 }, { name: 'ls', age: 21 }]);
    });

    it('columns & headline', function () {
      var list = csv.parse('姓名,年龄\n"z,\\"s",20\nls,21', true, [
        { name: 'name', displayName: '姓名' },
        { name: 'age', displayName: '年龄' }
      ]);
      assert.deepEqual(list, [{ name: 'z,\\"s', age: 20 }, { name: 'ls', age: 21 }]);
    });

  });


  describe('parseLine()', function () {

    it('case1', function () {
      var rs = csv.parseLine('1,"a\\",b",2,\'c,"d\',true,"true"');
      assert.deepEqual(rs, [1, 'a\\",b', 2, 'c,"d', true, 'true']);
    });

  });

});
```