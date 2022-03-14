# dataFrames.js

A small JS module that handles tabular data.

Example use:

```ts
import { DataFrame } from './dataFrames.js';


// create a DataFrame from some 2D array
let data: number[][] = [
  [0, 13, 20.0],
  [1, 16, 4.5],
  [2, 12, 7.0],
  [3, 12, 0.0],
  [4, 11, 34.5],
  [5, 16, 0.0],
];

let colNames: string[] = ['day', 'temperature', 'rain'];

let df: DataFrame = new DataFrame(data, colNames);


// show the data frame in the console
console.log(df.print());
```

![Screenshot]https://i.imgur.com/j5ODHsx.png
