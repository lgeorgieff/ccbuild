/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

var scriptName = JSON.parse(fs.readFileSync('./package.json')).name;

var expectedUsage = 'Usage: ' + scriptName + ' [-h|--help] [-v|--version] [--closure-help]\n' +
        '           [--config-help] [--closure-version] [--compiler-path]\n' +
        '           [--contrib-path] [--ignore-warnings] [-ignore-errors]\n' +
        '           [-c|--config PATH]... [--ignore-compiled-code] [--stop-on-error]\n' +
        '           [--stop-on-warning] [-u|--unit UNIT_NAME]... [--ignore-check-fs]\n' +
        '           [-n|--next NEXT_ENTRY]... [--cache-location PATH]\n' +
        '           [--disable-caching]\n\n' +
        'Checks and compiles JavaScript files via the Closure Compiler.\n\n' +
        '  -h|--help               Display this message and exit.\n' +
        '  -v|--version            Display version information and exit.\n' +
        '  --closure-help          Display the usage for the Closure Compiler and exit.\n' +
        '  --closure-version       Display the version of the Closure Compiler and exit.\n' +
        '  --compiler-path         Display the path to the Closure Compiler and exit.\n' +
        '  --contrib-path          Display the path to the contrib directory of the\n' +
        '                          Closure Compiler and exit.\n' +
        '  -c|--config PATH        Path to the configuration file ' + scriptName + ' should\n' +
        '                          use. If no configuration is specified ' + scriptName + '\n' +
        '                          checks the current directory for all files with the\n' +
        '                          file extension ".ccbuild". For every matched\n' +
        '                          configuration file ' + scriptName + ' performs a run.\n' +
        '                          You may specify multiple configurations.\n' +
        ' --config-help            Display a help message for the configuration file\n' +
        '                          format and exit.\n' +
        ' --ignore-warnings        Compilation warnings are not shown on stderr.\n' +
        ' --ignore-errors          Compilation errors are not shown on stderr.\n' +
        ' --ignore-compiled-code   The compiled code is not shown on stdout.\n' +
        ' --stop-on-error          All compilation processes are stopped in case a\n' +
        '                          compilation error occurs. ' + scriptName + ' will\n' +
        '                          exit with the exit code 1.\n' +
        ' --stop-on-warning        All compilation processes are stopped in case a\n' +
        '                          compilation warning occurs. ' + scriptName + ' will\n' +
        '                          exit with the exit code 1.\n' +
        ' -u|--unit UNIT_NAME      Filter the compilation units that are taken into\n' +
        '                          account for the compilation process. All other units\n' +
        '                          are ignored.\n' +
        '                          You may specify multiple compilation units.\n' +
        '                          If no compilation unit is specified, all units\n' +
        '                          defined in the configuration files will be processed.\n' +
        ' -n|--next NEXT_ENTRY     Filter the configuration files that are defined in the\n' +
        '                          "next" property and are taken into account to be\n' +
        '                          processed as next ' + scriptName + ' configuration.\n' +
        '                          All other configuration files listed in the "next"\n' +
        '                          properties are ignored.\n' +
        '                          You may specify multiple next entries.\n' +
        '                          If no "next" property is specified, all configuration\n' +
        '                          files defined in any "next" property of any processed\n' +
        '                          configuration file will be processed.\n' +
        ' --ignore-check-fs        Ignore the processing of the configuration property\n' +
        '                          "checkFs" which is responsible for checking whether\n' +
        '                          specified files are included in the defined\n' +
        '                          compilation units.\n' +
        ' --disable-caching        Don\'t cache results of compilation units. Using this\n' +
        '                          option may increase the run time of the ccbuild\n' +
        '                          process.\n' +
        ' --cache-location PATH    Set the location of the caching data. The default path\n' +
        '                          is $CWD/.ccbuild/.\n\n' +
        'ccbuild exits with the return code 0 in case of successful compilation(s) this\n' +
        'includes warnings as well. In case of compilation errors and file verification\n' +
        'errors the return code is 1.\n';

var expectedVersion = JSON.parse(fs.readFileSync('./package.json')).version;

var expectedConfigHelp = 'The configuration files for ' + scriptName + ' use the JSON format and are of the\n' +
        'following form:\n\n' +
        '{\n' +
        '  "checkFs": {\n' +
        '    "check": [\n' +
        '      "<GLOB paths to files to be checked whether they are included in any compilation unit>"\n' +
        '    ],\n' +
        '    "fileExtensions": [\n' +
        '      "<file extensions of files to be checked. This filter is applied on files resulting from ' +
        '\\\"check\\\". If nothing is specified, the default is set to \\\".js\\\" and \\\".json\\\">"\n' +
        '    ],\n' +
        '    "ignore": [\n' +
        '      "<GLOB paths to files that are ignored from checking>"\n' +
        '    ]\n' +
        '  },\n' +
        '  "sources": [\n' +
        '    "<source file paths to be included in all compilation units defined in this config>",\n' +
        '    "${CWD}/file.js"\n' +
        '  ],\n' +
        '  "externs": [\n' +
        '    "<extern file paths to be included in all compilation units defined in this config>",\n' +
        '    "${CONTRIB_PATH}/nodejs/os.js"\n' +
        '  ],\n' +
        '  "buildOptions": [\n' +
        '    "<options to be used for all compilation units defined in this config>"\n' +
        '  ],\n' +
        '  "warningsFilterFile": "<file path to a warnings filter file>",\n' +
        '  "compilationUnits": {\n' +
        '    "unit 1": {\n' +
        '      "externs": [\n' +
        '        "<source file paths to be used only for this compilation unit>"\n' +
        '      ],\n' +
        '      "sources": [\n' +
        '        "<extern file paths to be used only for this compilation unit>"\n' +
        '      ],\n' +
        '      "buildOptions": [\n' +
        '        "<options to be used only for this compilation unit>"\n' +
        '      ],\n' +
        '      "warningsFilterFile": "<file path to a local warnings filter file>"\n' +
        '    },\n' +
        '    "unit 2": {\n' +
        '      "externs": [\n' +
        '        "<source file paths to be used only for this compilation unit>"\n' +
        '      ],\n' +
        '      "sources": [\n' +
        '        "<extern file paths to be used only for this compilation unit>"\n' +
        '      ],\n' +
        '      "outputFile": "file path to resulting code",\n' +
        '      "buildOptions": [\n' +
        '        "<options to be used only for this compilation unit>"\n' +
        '      ]\n' +
        '    }\n' +
        '  },\n' +
        '  "next": {\n' +
        '    "<file path to the next config relative to this config>": {\n' +
        '      "inheritSources": "<boolean>",\n' +
        '      "inheritExterns": "<boolean>",\n' +
        '      "inheritBuildOptions": "<boolean>",\n' +
        '      "inheritWarningsFilterFile": "<boolean>"\n' +
        '    },\n' +
        '    "<file path to another config relative to this config>": {\n' +
        '      "inheritSources": "<boolean>"\n' +
        '    }\n' +
        '  }\n' +
        '}\n\n' +
        'Note: buildOptions can be either an array of strings or an object as specified\n' +
        'at https://www.npmjs.com/package/google-closure-compiler#specifying-options.';

module.exports.scriptName = scriptName;
module.exports.expectedUsage = expectedUsage;
module.exports.expectedVersion = expectedVersion;
module.exports.expectedConfigHelp = expectedConfigHelp;
