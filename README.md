# BibleAPI 0.1.0
Bible API RESTful web service developed with Node.js

----

## API

### Single passage

###### Single verse
http://localhost:4000/api/v1.0/Gen1:1

```
{
  verses: [
    {
      tran: "RUSV",
      book: 1,
      bookRef: "Gen",
      bookName: "Бытие",
      chapter: 1,
      verse: 1,
      text: "В начале сотворил Бог небо и землю."
    }
  ],
  text: "В начале сотворил Бог небо и землю."
}
```

###### Single chapter
http://localhost:4000/api/v1.0/Gen1

### Single passage range

###### Single verse range
http://localhost:4000/api/v1.0/Gen1:1-5

###### Single chapter range
http://localhost:4000/api/v1.0/Gen1-3

###### Single chapter and verses range
http://localhost:4000/api/v1.0/Gen1:1-2:5

### Multiple passages
http://localhost:4000/api/v1.0/Gen1;Gen2:1-3:5


## Development

### Setup
> npm install

### Run
> gulp

### Test
> mocha


## Demo
  > http://bibleapi-dev4christ.rhcloud.com
