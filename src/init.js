const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

const TEMPLATE_DIR = path.join(__dirname, '..', 'template');

const isDir = (name) => {
  const target = path.resolve(process.cwd(), path.join('.', name));
  try {
    const sign = fs.statSync(target).isDirectory();
    return !sign && true;
  } catch (err) {
    return true;
  }
};

const promptAns = (name) => {
  const ans = inquirer.prompt([
    {
      name: 'name',
      message: 'the package name:',
      default: name,
    },
    {
      name: 'version',
      message: 'the package version:',
      default: '0.0.1',
    },
    {
      name: 'desc',
      message: 'the description of the package:',
      default: name,
    },
    {
      name: 'author',
      message: 'author:',
    },
    {
      name: 'license',
      message: 'license:',
      default: null,
    },
  ]);
  return ans;
};

const modTmplate = (metadata={}, src, dest='.') => {
  const mod = new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        Object.keys(files).forEach((fileName) => {
          const t = files[fileName].contents.toString();
          files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta));
        });
        done();
      })
      .build((err) =>{
        err ? reject(err) : resolve();
      });
  });
  return mod;
};

const createProject = (name) => {
  const dest = path.resolve(process.cwd(), path.join('.', name));
  promptAns(name).then((ans) => {
    modTmplate(ans, TEMPLATE_DIR, dest)
      .then(() => {
        console.log(logSymbols.success, chalk.green('success!:)'))
        console.log()
        console.log(chalk.green('cd ' + name + '\nnpm install'))
      })
      .catch((err) => {
        console.log(logSymbols.error, chalk.red(`failed: ${err.message}`));
      });
  });
};

const init = (program, name) => {
  // params name is required
  if (!name) {
    program.help();
  }

  // check the project name
  if (isDir(name)) {
    createProject(name);
  } else {
    console.log('project is already existed.');
  }
};

export default init;
