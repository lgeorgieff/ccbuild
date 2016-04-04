# ccbuild
_ccbuild_ offers a thin layer on top of the [google-closure-compiler](https://www.npmjs.com/package/google-closure-compiler) package to set up a VERY LIGHTWEIGHT make system for [Node.js](https://nodejs.org/en/). The main idea behind _ccbuild_ is a set of configuration files that define compilation units of JavaScript sources and are also able to reference child configuration files and to inherit particular values.

# ccbuild options
```
Usage: ccbuild [-h|--help] [-v|--version] [--closure-help]
           [--closure-version] [--compiler-path] [--contrib-path]
           [--ignore-warnings] [-ignore-errors] [-c|--config PATH]...
           [--ignore-compiled-code] [--stop-on-error] [--config-help]
           [-u|--unit UNIT_NAME]...

Checks and compiles JavaScript files via the Closure Compiler.

  -h|--help               Display this message and exit.
  -v|--version            Display version information and exit.
  --closure-help          Display the usage for the Closure Compiler and exit.
  --closure-version       Display the version of the Closure Compiler and exit.
  --compiler-path         Display the path to the Closure Compiler and exit.
  --contrib-path          Display the path to the contrib directory of the
                          Closure Compiler and exit.
  -c|--config PATH        Path to the configuration file ccbuild
                          should use. If no configuration is specified
                          ccbuild checks the current directory for
                          all files with the file extension ".ccbuild". For
                          every matched configuration file ccbuild
                          performs a run.
                          You may specify multiple configurations
 --config-help            Display a help message for the configuration file
                          format and exit.
 --ignore-warnings        Compilation warnings are not shown on stderr.
 --ignore-errors          Compilation errors are not shown on stderr.
 --ignore-compiled-code   The compiled code is not shown on stdout.
 --stop-on-error          All compilation processes are stopped in case a
                          compilation error occurs. ccbuild will exit with
                          the exit code 1.
 --stop-on-warning        All compilation processes are stopped in case a
                          compilation warning occurs. ccbuild will exit with
                          the exit code 1.
 -u|--unit UNIT_NAME      Filter the compilation units that are taken into
                          account for the compilation process. All other units
                          are ignored.
                          You may specify multiple compilation units.
                          If no compilation unit is specified, all units
                          defined in the configuration files will be processed.

ccbuild exits with the return code 0 in case of successful compilation(s) this
includes warnings as well. In case of compilation errors the return code is 1.
```

# Configuration Files
_ccbuild_ operates on configuration files, i.e. without any configuration file nothing will happen. Usually the configuration files should be named in the form of *.ccbuild.
If no configuration file is specified via CLI, the `$CWD` is searched for all files of the form *.ccbuild. If at least one is found, it will be processed. In case multiple files are found, all of them are processed. To specify any configuration file via CLI, the option -c <FILE PATH> or --config <FILE PATH> must be used. It is possible to specify multiple configuration files. In case at least one configuration file is specified via CLI, `$CWD` is not searched for any default configuration file. A configuration file may reference another configuration file. In case circular references are found, a second run on a configuration file that was already processed will not be started. All relative paths in the fields _sources_, _externs_ and the _next_ property are resolved against the `__dirname` of the configuration file in which they are defined. Any file paths that are defined via the _buildOptions_ property must be defined relative to the location of the configuration file.

A configuration file is of the following form:

```json
{
  "checkFs": {
    "check": ["<GLOB paths to files to be checked whether they are included in any compilation unit>"],
    "fileExtensions": ["<file extensions of files to be checked. This filter is applied on files resulting from \"check\". If nothing is specified, the default is set to \".js\" and \".json\">"],
    "ignore": ["<GLOB paths to files that are ignored from checking>"]
  },
  "sources": ["<source file paths to be included in all compilation units defined in this config>"],
  "externs": ["<extern file paths to be included in all compilation units defined in this config>"],
  "buildOptions": ["<options to be used for all compilation units defined in this config>"],
  "compilationUnits": {
    "unit 1": {
      "externs": ["<source file paths to be used only for this compilation unit>"],
      "sources": ["<extern file paths to be used only for this compilation unit>"],
      "buildOptions": ["<options to be used only for this compilation unit>"]
    },
    "unit 2": {
      "externs": ["<source file paths to be used only for this compilation unit>"],
      "sources": ["<extern file paths to be used only for this compilation unit>"],
      "outputFile": "<file path to resulting code>",
      "buildOptions": ["<options to be used only for this compilation unit>"]
    },
  },
  "next": {
    "<file path to the next config relative to this config>": {
      "inheritSources": "<boolean>",
      "inheritExterns": "<boolean>",
      "inheritBuildOptions": "<boolean>"
    },
    "<file path to another config relative to this config>": {
      "inheritSources": "<boolean>",
      "inheritExterns": "<boolean>",
      "inheritBuildOptions": "<boolean>"
    }
  }
}
```
Note: buildOptions can be either an array of strings or an object as specified
at https://www.npmjs.com/package/google-closure-compiler#specifying-options.

# Use ccbuild programmatically
In addition to use _ccbuild_ as an executable, you may also use it directly from your code. Therefore it offers the type CCBuild that implements the _events.EventEmitter_ interface of Node.js. You may specify all supported arguments as an array of strings and pass it to the constructor of CCBuild. Afterwards CCBuild starts processing and emits the following events:
 * argsError
 * help
 * version
 * configHelp
 * closureHelp
 * closureVersion
 * compilerPath
 * contribPath
 * configError
 * circularDependencyError
 * compilationError
 * compiled
 * done

The following example illustratest how you can use CCBuild in your code:
```javascript
    var ccbuild = new CCBuild(process.argv);
    ccbuild.on('compilerPath', function (compilerPath) {
        console.log(compilerPath);
        process.exit(0);
    });
    ccbuild.on('configError', function (err) {
        console.error(err);
        process.exit(2);
    });
    ccbuild.on('compilationError', function (compilationUnit, err) {
        console.error(compilationUnit + ': ' + err);
        process.exit(1);
    });
    ccbuild.on('compiled', function (compilationUnit, stdout, stderr) {
        console.log(compilationUnit + ': ' + stdout + '\n');
        console.error('warnings: ' + stderr);
    });

    // ...
```

To check whether certain files are used in any of the compilation unit you may use the following code:
```javascript
    var ccfc = new CCFileCheck(process.argv);
    ccbuild.on('configError', function (err) {
        console.error(err);
        process.exit(2);
    });
    ccfc.on('verificationError', function (filePath, configFilePath) {
        console.error('The file "' + filePath + '" is not used in any compilation unit of "' + configFilePath + '"');
        process.exit(1);
    });
    ccfc.on('verificationSuccess', function (filePath, configFilePath) {
        console.log('The file "' + filePath + '" is used in a compilation unit of "' + configFilePath + '"');
        process.exit(1);
    });
    ccfc.on('done', function () {
        process.exit();
    });

    // ...
```

# License
This project is released under [MIT license](./LICENSE). Note: that each referenced npm package that is used has its own license and potentially it has further dependencies. Please check each package individually whether it confirms to your OSS licensing rules.
