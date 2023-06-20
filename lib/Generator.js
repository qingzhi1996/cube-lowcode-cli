const ora = require('ora');
const inquirer = require('inquirer');
const util = require('util');
const path = require('path');
const chalk = require('chalk');
const downloadGitRepo = require('download-git-repo'); // 不支持 Promise
const { getTemplateList, getTagList } = require('./http');

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
    return error
  } 
}

class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  async getTemplate() {
    // 1）从远程拉取模板数据
    const templateList = await wrapLoading(getTemplateList, 'waiting fetch template');
    if (!templateList) return;

    // 过滤我们需要的模板名称
    const templates = templateList.map(item => item.name);

    // 2）用户选择自己新下载的模板名称
    const { template } = await inquirer.prompt({
      name: 'template',
      type: 'list',
      choices: templates,
      message: 'Please choose a template to create project'
    })

    // 3）return 用户选择的名称
    return template;
  }

  // 获取用户选择的版本
  async getTag(template) {
    // 1）基于 template 结果，远程拉取对应的 tag 列表
    const tagsList = await wrapLoading(getTagList, 'waiting fetch tag', template);
    if (!tagsList) return;
    
    // 过滤我们需要的 tag 名称
    const tags = tagsList.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'Place choose a tag to create project'
    })

    // 3）return 用户选择的 tag
    return tag
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(template, tag){
    // 1）拼接下载地址
    const requestUrl = `zhurong-cli/${template}${tag?'#'+tag:''}`;

    // 2）调用下载方法
    const result = await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir) // 参数2: 创建位置
    )
    
    // 模板使用提示
    if (result === undefined) {
      console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
      console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
      console.log('  npm install')
      console.log('  npm run dev\r\n')
    }
  }

  // 核心创建逻辑
  async create(){
    // 1）获取模板名称
    const template = await this.getTemplate()
    // 2) 获取 tag 名称
    const tag = await this.getTag(template)
    
    // 3）下载模板到模板目录
    await this.download(template, tag)
  }
}

module.exports = Generator;
