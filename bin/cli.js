#! /usr/bin/env node

const program = require('commander');  // commander 自定义命令行指令 https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md
const figlet = require('figlet');  // figlet 脚手架LOGO https://www.npmjs.com/package/figlet
const chalk = require('chalk');  // chalk chalk（粉笔）可以美化我们在命令行中输出内容的样式，例如对重点信息添加颜色

program
  // 定义命令和参数
  .command('create <app-name>')
  .description('create a new project')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    // 打印执行结果
    // console.log('name:',name,'options:',options)
    require('../lib/create.js')(name, options)
  })
  
program
   // 配置版本号信息
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]')

// bin/cli.js

program
  .on('--help', () => {
    // 使用 figlet 绘制 Logo
    console.log('\r\n' + figlet.textSync('cube', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }));
    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`cube <command> --help`)} show details\r\n`)
  })
  
// 解析用户执行命令传入参数
program.parse(process.argv);
