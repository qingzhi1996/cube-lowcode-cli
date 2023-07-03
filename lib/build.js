const shell = require('shelljs'); // 在node脚本中执行shell命令
const fs = require('fs')
const path = require('path');

module.exports = async function () {
  // 执行启动命令
  const cwd  = process.cwd();

  // 进入新建物料环境
  shell.cd(__dirname);
  shell.cd('../node_modules/material_template')

  const fixEntry = async () => {
    //读取文件
    fs.readFile('webpack.config.js', 'utf8', function(err, data){
      if(err) {
        console.log("webpack.config.js获取失败" + err.message)
      } else {
        const entry = data.match(/entry:.*?\,/gi)[0];
        let removeOutput = '';
        if (data.indexOf("path: path.resolve(__dirname, 'dist')") !== -1) {
          const output = "path: path.resolve(__dirname, 'dist')";
          removeOutput = output.split(': ')[1];
        } else {
          const output = data.match(/path:.*?\,/gi)[0];
          removeOutput = output.split(': ')[1].split(',')[0];
        }

        const removeEntry = entry.split(': ')[1].split(',')[0];

        const entryPath = path.join(cwd, '/index.tsx').replace(/\\/g,'/')
        const outputPath = path.join(cwd, '/dist').replace(/\\/g,'/')
        
        const entryConfig = data.replace(removeEntry, JSON.stringify(entryPath));
        const currentConfig = entryConfig.replace(removeOutput, JSON.stringify(outputPath));
        // 写入文件
        fs.writeFile('webpack.config.js', currentConfig, function(err){
            if(err) {
              console.log("环境入口写入失败！")
            } else {
              console.log("环境入口写入成功！")
              shell.exec('npm run build')
            }
        })
      }
    })
  }

  fixEntry()
}
