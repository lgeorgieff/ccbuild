'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var CC = require('google-closure-compiler');

/**
 * @ignore
 * @suppress {duplicate}
 */
var CCBuild = /** @type {function(new:CCBuild, Array<string>)} */ (require('../../src/CCBuild.js'));

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

var scriptName = JSON.parse(fs.readFileSync('./package.json')).name;

var expectedUsage = 'Usage: ' + scriptName + ' [-h|--help] [-v|--version] [--closure-help]\n' +
        '           [--config-help] [--closure-version] [--compiler-path]\n' +
        '           [--contrib-path] [--ignore-warnings] [-ignore-errors]\n' +
        '           [-c|--config PATH]... [--ignore-compiled-code] [--stop-on-error]\n' +
        '           [--stop-on-warning]\n\n' +
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
        '                          file extension ".nbuild". For every matched\n' +
        '                          configuration file ' + scriptName + ' performs a run.\n' +
        ' --config-help            Display a help message for the configuration file\n' +
        '                          format and exit.\n' +
        ' --ignore-warnings        Compilation warnings are not shown on stderr.\n' +
        ' --ignore-errrors         Compilation errors are not shown on stderr.\n' +
        ' --ignore-compiled-code   The compiled code is not shown on stdout.\n' +
        ' --stop-on-error          All compilation processes are stopped in case a\n' +
        '                          compilation error occurs. ' + scriptName + ' will\n' +
        '                          exit with the exit code 1.\n' +
        ' --stop-on-warning        All compilation processes are stopped in case a\n' +
        '                          compilation warning occurs. ' + scriptName + ' will\n' +
        '                          exit with the exit code 1.\n';

var expectedVersion = JSON.parse(fs.readFileSync('./package.json')).version;

var expectedConfigHelp = 'The configuration files for ' + scriptName + ' use the JSON format and are of the\n' +
        'following form:\n\n' +
        '{\n' +
        '  "sources": [<source file paths to be included in all compilation units defined in this config>],\n' +
        '  "externs": [<extern file paths to be included in all compilation units defined in this config>],\n' +
        '  "buildOptions": [<options to be used for all compilation units defined in this config>],\n' +
        '  "compilationUnits": {\n' +
        '    "unit 1": {\n' +
        '      "externs": [<source file paths to be used only for this compilation unit>],\n' +
        '      "sources": [<extern file paths to be used only for this compilation unit>],\n' +
        '      "buildOptions": [<options to be used only for this compilation unit>]\n' +
        '    },\n' +
        '    "unit 2": {\n' +
        '      "externs": [<source file paths to be used only for this compilation unit>],\n' +
        '      "sources": [<extern file paths to be used only for this compilation unit>],\n' +
        '      "outputFile": "file path to resulting code",\n' +
        '      "buildOptions": [<options to be used only for this compilation unit>]\n' +
        '    },\n' +
        '  },\n' +
        '  "next": {\n' +
        '    "<file path to the next config relative to this config>": {\n' +
        '      "inheritSources": <boolean>,\n' +
        '      "inheritExterns": <boolean>,\n' +
        '      "inheritBuildOptions": <boolean>\n' +
        '    },\n' +
        '    "<file path to another config relative to this config>": {\n' +
        '      "inheritSources": <boolean>,\n' +
        '      "inheritExterns": <boolean>,\n' +
        '      "inheritBuildOptions": <boolean>\n' +
        '    }\n' +
        '  }\n' +
        '}\n\n' +
        'Note: buildOptions can be either an array of strings or an object as specified\n' +
        'at https://www.npmjs.com/package/google-closure-compiler#specifying-options.';

describe('CCBuild class', function () {
    beforeEach(function () {
        this.resourcesToDelete = [];
    });

    afterEach(function () {
        if (util.isArray(this.resourcesToDelete)) {
            this.resourcesToDelete.forEach(function (resource) {
                try {
                    if (fs.statSync(resource).isDirectory()) fs.rmdirSync(resource);
                    else fs.unlinkSync(resource);
                } catch (err) {
                    console.error(err);
                }
            });
        }
    });

    it('accepts default parameter when instantiating', function () {
        expect(new CCBuild([])).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild()).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild(null)).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild(undefined)).toEqual(jasmine.any(CCBuild));
    });

    it('throws in case of bad argument', function () {
        expect(function () { new CCBuild({}); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild(123); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild('--help'); }).toThrow(jasmine.any(Error));
    });

    it('processes --help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--help']);
        ccbuild.on('help', function (usage) {
            expect(usage).toBe(expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -h', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-h']);
        ccbuild.on('help', function (usage) {
            expect(usage).toBe(expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --version', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--version']);
        ccbuild.on('version', function (version) {
            expect(version).toBe(expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -v', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-v']);
        ccbuild.on('version', function (version) {
            expect(version).toBe(expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --closure-help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-help']);
        var eventHandler = jasmine.createSpy('eventHandler');
        ccbuild.on('closureHelp', function (closureHelp) {
            expect(closureHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --closure-version', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-version']);
        ccbuild.on('closureVersion', function (closureVersion) {
            var compiler = new CC.compiler(['--version']);
            compiler.run(function (code, stdout, stderr) {
                if (code !== 0 || stderr) {
                    done.fail(new Error(code + ': ' + stderr));
                } else {
                    expect(closureVersion).toBe(stdout);
                    expect(closureVersion.length).toBeGreaterThan(0);
                    done();
                }
            });
        });
    });

    it('processes --compiler-path', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--compiler-path']);
        ccbuild.on('compilerPath', function (compilerPath) {
            expect(compilerPath).toBe(CC.compiler.COMPILER_PATH);
            expect(compilerPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --contrib-path', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--contrib-path']);
        ccbuild.on('contribPath', function (contribPath) {
            expect(contribPath).toBe(CC.compiler.CONTRIB_PATH);
            expect(contribPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --config-help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config-help']);
        ccbuild.on('configHelp', function (configHelp) {
            expect(configHelp).toBe(expectedConfigHelp);
            expect(configHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('emits the event argsError', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config-hel']);
        ccbuild.on('argsError', function (err) {
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
    });

    it ('emits the event argsParsed', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1]]);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({});
            done();
        });
    });

    it('processes --ignore-warnings', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-warnings']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreWarnings: true});
            done();
        });
    });

    it('processes --ignore-errors', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-errors']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreErrors: true});
            done();
        });
    });

    it('processes --ignore-compiled-code', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-compiled-code']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreCompiledCode: true});
            done();
        });
    });

    it('processes --stop-on-error', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-error']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnError: true});
            done();
        });
    });

    it('processes --stop-on-warning', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-warning']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnWarning: true});
            done();
        });
    });

    it('processes --config configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes -c configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-c', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes multiple --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath3']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2'),
                                            path.resolve('configPath3')]});
            done();
        });
    });

    it('processes duplciate --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath1', '--config', 'configPath2']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2')]});
            done();
        });
    });

    it ('emits the event argsParsed with a proper args object', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-c', 'PATH1', '--config', 'PATH2',
                                   '--ignore-warnings', '--ignore-errors', '--ignore-compiled-code', '--stop-on-error',
                                   '--stop-on-warning']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({
                configs: [path.resolve('PATH1'), path.resolve('PATH2')],
                ignoreWarnings: true,
                ignoreErrors: true,
                ignoreCompiledCode: true,
                stopOnError: true,
                stopOnWarning: true
            });
            done();
        });
    });

    it('emits done after finished with config -- 1 compilation unit', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        ccbuild.on('compiled', function (compilationName, stdout, stderr) {
            ccbuild.on('done', done);
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 1 errornous compilation unit', function (done) {
        var config = {
            sources: ['./data/source4.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                }
            }
        };

        var configPath = path.join(__dirname, 'config2.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compilationErrordHandler = jasmine.createSpy('compilationErrorHandler');
        ccbuild.on('compilationError', compilationErrordHandler);
        ccbuild.on('done', function () {
            expect(compilationErrordHandler.calls.count()).toBe(1);
            done();
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 3 compilation units', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                },
                unit2: {
                    sources: ['data/source2.js'],
                    externs: ['./data/externs2.js']
                },
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config2.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(3);
            done();
        });

        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 3 compilation units incl. error', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                },
                unit2: {
                    sources: ['data/source2.js']
                },
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config3.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        var compilationErrorHandler = jasmine.createSpy('compilationErrorHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('compilationError', compilationErrorHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(2);
            expect(compilationErrorHandler.calls.count()).toBe(1);
            done();
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with multiple configs -- 4 compilation units', function (done) {
        var configPath1 = path.join(__dirname, 'config4.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config5.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config6.ccbuild');
        var temporaryConfigDirectory = path.join(__dirname, 'data', 'configs');
        try {
            fs.mkdirSync(temporaryConfigDirectory);
        } catch (err) {
            console.error(err);
        }

        var config1 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            compilationUnits: {
                unit1: {
                    buildOptions: ['--flagfile', './data/test_flagfile']
                }
            },
            next: {}
        };
        config1.next[path.relative(path.dirname(configPath1), configPath2)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config2 = {
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    externs: ['./externs2.js'],
                    buildOptions: ['--flagfile', './test_flagfile']
                }
            },
            next: {}
        };
        config2.next[path.relative(path.dirname(configPath2), configPath3)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            sources: ['../source1.js'],
            externs: ['../externs1.js'],
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(4);
            done();
        });

        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('emits done after finished with multiple configs -- 4 compilation units incl. errors', function (done) {
        var configPath1 = path.join(__dirname, 'config7.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config8.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config9.ccbuild');
        var temporaryConfigDirectory = path.join(__dirname, 'data', 'configs');
        try {
            fs.mkdirSync(temporaryConfigDirectory);
        } catch (err) {
            console.error(err);
        }

        var config1 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            compilationUnits: {
                unit1: {
                    buildOptions: ['--flagfile', './data/test_flagfile']
                }
            },
            next: {}
        };
        config1.next[path.relative(path.dirname(configPath1), configPath2)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config2 = {
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    buildOptions: ['--flagfile', './test_flagfile']
                }
            },
            next: {}
        };
        config2.next[path.relative(path.dirname(configPath2), configPath3)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            sources: ['../source1.js'],
            externs: ['../externs1.js'],
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        ccbuild.on('compiled', compiledHandler);
        var compilationErrorHandler = jasmine.createSpy('compilationErrorHandler');
        ccbuild.on('compilationError', compilationErrorHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(2);
            expect(compilationErrorHandler.calls.count()).toBe(2);
            done();
        });

        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });
});
