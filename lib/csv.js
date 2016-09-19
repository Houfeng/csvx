const os = require('os');
const utils = require('ntils');
const Class = require('cify').Class;

/**
 * 定义 CSV 解析类
 **/
const CSV = new Class({

  constructor(options) {
    this.options = options || {};
    this.options.eol = this.options.eol || os.EOL;
    this.options.spliter = this.options.spliter || ',';
    this.options.quote = this.options.quote || '"';
    this.options.shadowSpliter = '\u0000';
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
      var csvItem = csvLine.replace(
        new RegExp(this.options.quote + '(.*)' + this.options.quote, 'igm'),
        function () {
          return arguments[1].replace(
            new RegExp(this.options.spliter, 'igm'),
            this.options.shadowSpliter
          );
        }.bind(this)
      ).split(this.options.spliter);
      if (columns == null) return csvItem;
      var objItem = {};
      utils.each(columns, function (index, col) {
        objItem[col.name] = csvItem[index].replace(
          new RegExp(this.options.shadowSpliter, 'igm'),
          this.options.spliter
        );
      }, this);
      return objItem;
    }, this);
    return objList;
  }

});

module.exports = CSV;