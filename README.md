# Bible API 0.2.0
Bible API RESTful web service developed with Node.js

----

## API

### Single passage

###### Single verse
[http://localhost:3333/api/Gen1:1](http://localhost:3333/api/v1/Gen1:1)

```
{
  verses: [
    {
      book: 1,
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heaven and the earth.",
      tran: "KJV",
      bookRef: "Gen",
      bookName: "Genesis"
    }
  ],
  text: "In the beginning God created the heaven and the earth."
}
```

###### Single chapter
[http://localhost:3333/api/Gen1](http://localhost:3333/api/Gen1)

### Single passage range

###### Single verse range
[http://localhost:3333/api/Gen1:1-5](http://localhost:3333/api/Gen1:1-5)

###### Single chapter range
[http://localhost:3333/api/Gen1-3](http://localhost:3333/api/Gen1-3)

###### Single chapter and verses range
[http://localhost:3333/api/Gen1:1-2:5](http://localhost:3333/api/Gen1:1-2:5)

### Multiple passages
[http://localhost:3333/api/Gen1;Gen2:1-3:5](http://localhost:3333/api/Gen1;Gen2:1-3:5)

### Supported translations
- KJV
- ASV

#### Single translation
[http://localhost:3333/api/Gen1:1ASV](http://localhost:3333/api/Gen1:1ASV)

```
{
  verses: [
    {
      book: 1,
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heaven and the earth.",
      tran: "ASV",
      bookRef: "Gen",
      bookName: "Genesis"
    }
  ],
  text: "In the beginning God created the heaven and the earth."
}
```

#### Multiple translations
[http://localhost:3333/api/Gen1:1KJV;ASV](http://localhost:3333/api/Gen1:1KJV;ASV)

```
{
  verses: [
    {
      book: 1,
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heaven and the earth.",
      tran: "KJV",
      bookRef: "Gen",
      bookName: "Genesis"
    },
    {
      book: 1,
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heavens and the earth.",
      tran: "ASV",
      bookRef: "Gen",
      bookName: "Genesis"
    }
  ]
}
```

### Meta data
[http://localhost:3333/api/meta/KJV](http://localhost:3333/api/meta/KJV)

## Development

### Prerequisites
- [MongoDB](https://www.mongodb.org)
- [Node.js](https://www.nodejs.org)

### Setup

#### Database

Import JSON files from this repo:
https://github.com/dev4christ/usfm2json/tree/master/json

##### KJV
> mongoimport --db bibleapi --collection bible --type json --file kjv.json

##### ASV
> mongoimport --db bibleapi --collection bible --type json --file asv.json

#### NPM Modules
> npm install

### Run
> gulp

### Test
> mocha


## Demo
> - [http://bibleapi.ws/Gen1](http://bibleapi.ws/Gen1)
> - [http://bibleapi.ws/Gen1:1](http://bibleapi.ws/Gen1:1)
