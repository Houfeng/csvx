var os = require('os');
var utils = require('ntils');
var Class = require('cify').Class;

/**
 * 定义 CSV 解析类
 **/
var CSV = new Class({

  constructor: function (options) {
    this.options = options || {};
    this.options.eol = this.options.eol || os.EOL;
    this.options.spliter = this.options.spliter || ',';
    this.options.quote = this.options.quote || '"';
    this.options.bom = this.options.bom ? '\ufeff' : '';
  },

  _generateColumns: function (item) {
    var columns = [];
    if (utils.isString(item)) {
      return item.split(this.options.spliter).map(function (name) {
        return {
          name: name
        }
      });
    }
    utils.each(item, function (name) {
      columns.push({
        name: name
      });
    }, this);
    return columns;
  },

  /**
   * 生成字符串
   **/
  stringify: function (objList, headLine, columns) {
    objList = JSON.parse(JSON.stringify(objList));
    if (!objList || objList.length < 1) return '';
    columns = columns || this._generateColumns(objList[0]);
    var csvList = [];
    objList.forEach(function (objItem) {
      var csvItem = [];
      utils.each(columns, function (index, col) {
        var val = (objItem[col.name] || '').toString();
        if (val.indexOf(this.options.spliter) > -1) {
          val = [
            this.options.quote,
            val.replace(new RegExp(this.options.quote, 'igm'), '\\' + this.options.quote, 'igm'),
            this.options.quote
          ].join('');
        }
        csvItem.push(val);
      }, this);
      csvList.push(csvItem.join(this.options.spliter));
    }, this);
    if (headLine) {
      csvList.unshift(columns.map(function (col) {
        return col.displayName || col.name;
      }, this).join(this.options.spliter));
    }
    return this.options.bom + csvList.join(this.options.eol);
  },

  /**
   * 转换为对象数组
   **/
  parse: function (csvText, headLine, columns) {
    if (!csvText) return [];
    var csvList = csvText.split(this.options.eol);
    if (!csvList || csvList.length < 1) return [];
    if (headLine) {
      var firstItem = csvList.shift();
      var oldColumns = columns;
      columns = this._generateColumns(firstItem).map(function (item) {
        if (!oldColumns) return item;
        item.name = (oldColumns.filter(function (oldItem) {
          return oldItem.displayName == item.name;
        }, this)[0] || item).name;
        return item
      }, this);
    }
    var objList = csvList.map(function (csvLine) {
      var csvItem = this.parseLine(csvLine);
      if (columns == null) return csvItem;
      var objItem = {};
      utils.each(columns, function (index, col) {
        objItem[col.name] = csvItem[index];
      }, this);
      return objItem;
    }, this);
    return objList;
  },

  parseLine: function (line) {
    var index = 0, length = line.length;
    var token = '', tokens = [];
    while (index <= length) {
      var char = line[index++];
      if (utils.isNull(char) || char == this.options.spliter) {
        tokens.push(token);
        token = '';
      } else if (char == this.options.quote) {
        char = line[index++];
        while (
          !utils.isNull(char) &&
          (char != this.options.quote || line[index - 2] == '\\')) {
          token += char;
          char = line[index++];
        }
      } else {
        while (!utils.isNull(char) && char != this.options.spliter) {
          token += char;
          char = line[index++];
        }
        index--;
        token = token.trim();
        if (!isNaN(token)) token = Number(token);
        if (token == 'false') token = false;
        if (token == 'true') token = true;
      }
    }
    return tokens;
  }

});

module.exports = CSV;