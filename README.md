# ccbuild
_ccbuild_ offers a thin layer on top of the [google-closure-compiler](https://www.npmjs.com/package/google-closure-compiler) package to set up a VERY LIGHTWEIGHT make system for [Node.js](https://nodejs.org/en/). The main idea behind _ccbuild_ is a set of configuration files that define compilation units of JavaScript sources and are also able to reference child configuration files and to inherit particular values.

# ccbuild options
```
Usage: ccbuild [-h|--help] [-v|--version] [--closure-help]
           [--closure-version] [--compiler-path] [--contrib-path]
           [--ignore-warnings] [-ignore-errors] [-c|--config PATH]...
           [--config-help]

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
                          all files with the file extension ".nbuild". For
                          every matched configuration file ccbuild
                          performs a run.
 --config-help            Display a help message for the configuration file
                          format and exit.
 --ignore-warnings        Compilation warnings are not shown on stderr.
 --ignore-errrors         Compilation errors are not shown on stderr.
 --ignore-compiled-code   The compiled code is not shown on stdout.
```

# Configuration Files
_ccbuild_ operates on configuration files, i.e. without any configuration file nothing will happen. Usually the configuration files should be named in the form of *.ccbuild.
If no configuration file is specified via CLI the `$CWD` is searched for all files of the form *.ccbuild. If at least one if found, it will be processed. In case multiple files are found, all of them are processed. To specify any configuration file via CLI, the option -c <FILE PATH> or --config <FILE PATH> must be used. IT is possible to specify multiple configuration files. In case at least one configuration file is specified via CLI, `$CWD` is not searched for any default configuration file. A configuration file may reference another configuration file. In case circular references are found, a second run on a configuration file that was already processed will not be started. All relative paths in the fields _sources_, _externs_ and the _next_ property are resolved against the `__dirname` of the configuration file in which they are defined.

A configuration file is of the following form:

```json
{
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

# License
This project is released under [MIT license](./LICENSE). Note: that each referenced npm package that is used has its own license and potentially it has further dependencies. Please check each package individually whether it confirms to your OSS licensing rules.
