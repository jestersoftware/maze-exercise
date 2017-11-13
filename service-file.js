/*
* FILE SERVICE
*/

const fs = require('fs')
const path = require('path')

function getFiles(dirname) {
  let files = fs.readdirSync(
    path.join(dirname, 'server', 'data')
  )

  return files.map(f => f.split('.')[0])
}

function getFile(filename, dirname) {
  return fs.readFileSync(
    path.join(dirname, 'server', 'data', filename + '.txt' /* 'maze3.txt' */),
    'utf8' //,
    // function (err, data) {
    //   if (err) {
    //     return console.log('error', err);
    //   }

    //   console.log('maze id', filename);
    //   console.log(data);

    //   return data;
    // }
  )
}

function saveFile(filename, dirname, content) {
  return fs.writeFileSync(
    path.join(dirname, 'server', 'data', filename + '.txt'),
    content,
    'utf8'/* ,
    function (err) {
      if (err) {
        return console.log(err);
      }

      console.log('The file has been saved!');
    } */
  )
}

module.exports = () => {
  return {
    getFiles: getFiles,
    getFile: getFile,
    saveFile: saveFile
  }
}
