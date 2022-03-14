var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const parseDataPoint = function (data, decimal) {
    // replaces decimal sign if the passed value is a string representing a number
    // needed for CSV strings with different decimal characters than '.'
    const val = parseFloat(data.replace(decimal, '.'));
    if (isNaN(val)) {
        // returns value as a string
        return data;
    }
    else {
        // returns a number
        return val;
    }
};
const getCSVData = function (CSVstring, delimiter, decimal) {
    // turns a string into a 2D array
    // turn all but the 0th row from the string into an array of strings (1 row = 1 string)
    const rawTable = CSVstring.split('\r\n').slice(1);
    // get the column names from the first row
    const names = CSVstring.split('\r\n')[0].split(delimiter);
    const data = [];
    rawTable.forEach((element) => {
        if (element != '') {
            // ignore empty lines
            const row = element.split(delimiter);
            data.push(row.map((p) => {
                return parseDataPoint(p, decimal);
            }));
        }
    });
    return [names, data];
};
const getCol = function (matrix, col) {
    // returns a column of a 2D array (array of rows)
    const column = [];
    for (let i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col]);
    }
    return column;
};
const getCommonElements = function (arrays) {
    // https://codereview.stackexchange.com/questions/96096/find-common-elements-in-a-list-of-arrays
    // Assumes that we are dealing with an array of arrays of integers
    // TODO: does this really only work with integers?
    let currentValues = {};
    let commonValues = {};
    for (let i = arrays[0].length - 1; i >= 0; i--) {
        //Iterating backwards for efficiency
        currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
    }
    for (let i = arrays.length - 1; i > 0; i--) {
        const currentArray = arrays[i];
        for (let j = currentArray.length - 1; j >= 0; j--) {
            if (currentArray[j] in currentValues) {
                commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
            }
        }
        currentValues = commonValues;
        commonValues = {};
    }
    return Object.keys(currentValues).map((value) => {
        return parseInt(value);
    });
};
const save = function (filename, data) {
    // opens a file dialogue, little bit of a hack
    // TODO: seems deprecated?
    const blob = new Blob([data], { type: 'text/csv' });
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename.split('/').pop() || 'default.csv';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
};
export class DataFrame {
    constructor(data = [], names = []) {
        // check passed data for consistency
        // TODO: detect/store types of columns somehow?
        if (names.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].length != names.length) {
                    console.error(`Length of row does not match number of column names (${names.length}) : ${data[i]}`);
                }
            }
        }
        else {
            // if no column names are given, check if rows are of equal length
            for (let i = 0; i < data.length; i++) {
                if (data[i].length != data[0].length) {
                    console.error('Inconsistent length of row: ', data[i]);
                }
            }
        }
        this.data = data;
        this.names = names;
    }
    get length() {
        return this.data.length;
    }
    get size() {
        return [this.names.length, this.data.length];
    }
    toJSON() {
        let jsonObj = {
            'names': this.names,
            'data': this.data
        };
        return JSON.stringify(jsonObj);
    }
    loadCSV(CSVstring, delimiter = ',', decimal = '.') {
        // loads data from a csv string and replaces the current data with it
        let data = getCSVData(CSVstring, delimiter, decimal);
        this.names = data[0];
        this.data = data[1];
    }
    static fromJSON(jsonString) {
        let jsonObj = JSON.parse(jsonString);
        return new DataFrame(jsonObj.data, jsonObj.names);
    }
    static fromCSV(CSVstring, delimiter = ',', decimal = '.') {
        // almost the same as loadCSV, but returns a DataFrame instance
        let df = new DataFrame();
        df.loadCSV(CSVstring, delimiter, decimal);
        return df;
    }
    writeCSV(filename, delimiter = ',', decimal = '.') {
        return __awaiter(this, void 0, void 0, function* () {
            let csvString = this.names.toString().replaceAll(',', delimiter);
            csvString += '\r\n';
            this.data.forEach((row) => {
                row.forEach(cell => {
                    // Check if cell contains number
                    if (isNaN(cell)) {
                        // this should be string
                        csvString += cell + delimiter;
                    }
                    else {
                        // replace decimal character
                        csvString += cell.toString().replace('.', decimal) + delimiter;
                    }
                });
                csvString += '\r\n';
            });
            save(filename, csvString);
        });
    }
    getColumnByIndex(index) {
        return getCol(this.data, index);
    }
    getColumnByName(name) {
        return getCol(this.data, this.names.findIndex(n => n === name));
    }
    getRow(index) {
        return this.data[index];
    }
    addColumn(data, name) {
        // append one data point to each of the rows
        for (let i = 0; i < this.data.length; i++) {
            if (typeof data[i] !== 'undefined') {
                this.data[i].push(data[i]);
            }
            else {
                // append NaN if data array contains no more elements to represent a missing value
                this.data[i].push(NaN);
            }
        }
        // append the column name
        this.names.push(name);
    }
    uniqueValues(columnName) {
        // returns a list of unique values in the given column
        if (this.names.includes(columnName)) {
            return Array.from(new Set(this.getColumnByName(columnName)));
        }
        else {
            console.error('Invalid Column Name: ', columnName);
            return [];
        }
    }
    where(conditions) {
        // TODO is it possible to annotate the argument more precisely?
        // returns a slice of data that meet the given conditions
        // conditions is an object with {"name": "value"} pairs
        // where "name" corresponds to a column name
        let indicesArray = [];
        for (let key in conditions) {
            // key is column name
            // get indices from this column for which the condition is true
            let validIndices = [];
            let col = this.getColumnByName(key);
            col.forEach((elem, index) => {
                if (elem == conditions[key]) {
                    validIndices.push(index);
                }
            });
            indicesArray.push(validIndices);
        }
        // get the indices for which all conditions were true
        let commonIndices = getCommonElements(indicesArray);
        let returnedRows = [];
        for (let index of commonIndices) {
            returnedRows.push(this.data[index]);
        }
        return new DataFrame(returnedRows, this.names);
    }
    sortBy(name, descending = false) {
        // sorts the given column and rearranges all other columns accordingly
        // TODO: this looks like a nightmare for type safety...
        // check if passed name does even exist
        if (!this.names.includes(name)) {
            console.warn(`"${name} is not a column name.`);
            return;
        }
        // sort rows
        this.data = this.data.sort((a, b) => {
            if (typeof a[this.names.indexOf(name)] === 'number') {
                return (a[this.names.indexOf(name)] - b[this.names.indexOf(name)]) * (descending ? -1 : 1);
            }
            else if (typeof a[this.names.indexOf(name)] === 'string') {
                return a[this.names.indexOf(name)].localeCompare(b[this.names.indexOf(name)]) * (descending ? -1 : 1);
            }
            else {
                // just whatever 💁‍♂️
                console.warn('Trying to sort a column that is neither a number nor a string.');
                return -1;
            }
        });
    }
    print(floatPrecision = 2) {
        // string representation for data for logging
        // TODO: also print the index as first column?
        // find longest value in data
        let maxlen = new Array(this.names.length).fill(0); // separate maxlen value for each column
        let len;
        // convert data points to strings and store
        let dataForPrint = [];
        for (let i = 0; i < this.data.length; i++) {
            dataForPrint[i] = [];
            for (let j = 0; j < this.data[i].length; j++) {
                // check if data point is a float
                if (typeof this.data[i][j] === 'number' && !Number.isInteger(this.data[i][j])) {
                    dataForPrint[i][j] = this.data[i][j].toFixed(floatPrecision);
                }
                else {
                    dataForPrint[i][j] = this.data[i][j].toString();
                }
                len = dataForPrint[i][j].length;
                if (len > maxlen[j]) {
                    maxlen[j] = len;
                }
            }
        }
        let strRep = '';
        // first row are the column names
        let header = '';
        for (let i = 0; i < this.names.length; i++) {
            // if maxvalue is greater than the string length, add more spaces to the front
            header += ' '.repeat(Math.max(0, maxlen[i] - this.names[i].length)) + this.names[i] + ' ';
        }
        strRep += header + '\n';
        // separator line
        strRep += '-'.repeat(header.length - 1) + '\n';
        // data rows
        for (let i = 0; i < dataForPrint.length; i++) {
            let rowRep = '';
            for (let j = 0; j < dataForPrint[i].length; j++) {
                // align to column header, or max length of values
                let headerLen = Math.max(maxlen[j] + 1, this.names[j].length + 1); // add at least one space
                let numSpaces = Math.max(0, headerLen - dataForPrint[i][j].length - 1);
                rowRep += ' '.repeat(numSpaces) + dataForPrint[i][j] + ' ';
            }
            strRep += rowRep + '\n';
        }
        return strRep;
    }
}
