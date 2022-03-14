import { DataFrame } from './dataFrames.js';
// create a DataFrame from some 2D array
let data = [
    [0, 13, 20.0],
    [1, 16, 4.5],
    [2, 12, 7.0],
    [3, 12, 0.0],
    [4, 11, 34.5],
    [5, 16, 0.0],
];
let colNames = ['day', 'temperature', 'rain'];
let df = new DataFrame(data, colNames);
// print the whole data frame
console.log(df.print());
// print rows where "temperature" is equal to 12
console.log(df.where({ 'temperature': 12 }).print());
// add a new column
df.addColumn([100, 80, 90, 65, 100, 60], 'humidty');
console.log(df.print());
// add strings as data
df.addColumn(['yes', 'yes', 'yes', 'no', 'yes', 'no'], 'isRaining');
console.log(df.print());
// add incomplete column
df.addColumn([10, 30, 11, 14], 'windSpeed');
console.log(df.print());
// show unique values of column "temperature"
console.log(df.uniqueValues('temperature'));
// sort by specific column
df.sortBy('temperature');
console.log(df.print());
df.sortBy('isRaining');
console.log(df.print());
// sort in descending order
df.sortBy('day', true);
console.log(df.print());
// save DataFrame to a file
df.writeCSV('test.csv');
// create a DataFrame from a csv string
let csvString = "name,age,income\r\nJohn,24,50000\r\nJenna,30,56000\r\nJill,24,30000\r\n";
let salaries = DataFrame.fromCSV(csvString);
console.log(salaries.print());
