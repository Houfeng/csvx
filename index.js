var os = require("os");
var utils = require("real-utils");

/**
 * 定义 CSV 解析类
 **/
var CSV = function (options) {
	var self = this;
	self.options = options || {};
	self.options.rowSpliter = self.options.rowSpliter || os.EOL;
	self.options.colSpliter = self.options.colSpliter || ",";
};

CSV.prototype._getFields = function (csvRow) {
	var self = this;
	if (!self.options.fields) {
		self.options.fields = [];
		utils.each(csvRow, function (key) {
			self.options.fields.push(key);
		});
	}
	return self.options.fields;
};

/**
 * 生成字符串
 **/
CSV.prototype.stringify = function (csvObject) {
	var self = this;
	csvObject = JSON.parse(JSON.stringify(csvObject));
	if (!csvObject || csvObject.length < 1) {
		return "";
	}
	var fields = self._getFields(csvObject[0]);
	var csvBuffer = [];
	csvObject.forEach(function (csvRow) {
		var itemBuffer = [];
		utils.each(fields, function (index, field) {
			itemBuffer.push(csvRow[field]);
		});
		csvBuffer.push(itemBuffer.join(self.options.colSpliter));
	});
	if (self.options.hasTitle) {
		csvBuffer.unshift(fields.join(self.options.colSpliter));
	}
	return csvBuffer.join(self.options.rowSpliter);
};

/**
 * 转换为对象数组
 **/
CSV.prototype.parse = function (csvText) {
	var self = this;
	if (!csvText) {
		return [];
	}
	var csvRows = csvText.split(self.options.rowSpliter);
	if (!csvRows || csvRows.length < 1) {
		return [];
	}
	var titles = null;
	if (self.options.hasTitle) {
		titles = csvRows[0].split(self.options.colSpliter);
		csvRows = csvRows.slice(1);
	}
	var csvObject = csvRows.map(function (csvRow) {
		var csvCols = csvRow.split(self.options.colSpliter);
		if (titles == null) {
			return csvCols;
		} else {
			var item = {};
			utils.each(titles, function (index, title) {
				item[title] = csvCols[index];
			});
			return item;
		}
	});
	return csvObject;
};

module.exports = CSV;