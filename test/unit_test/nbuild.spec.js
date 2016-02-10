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

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/**
 * @ignore
 * @suppress {duplicate}
 */
var child_process = require('child_process');
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('nbuild', function () {
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

    it('compile with single config -- success', function (done) {
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

        var configPath = path.join(__dirname, 'config1.nbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/nbuild.js --config ./test/unit_test/config1.nbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    xit('compile with single config -- error', function () {
        var config = {
            sources: [],
            externs: [],
            buildOptions: [],
            compilationUnits: {}
        };
    });

    xit('compile with multiple default configs', function () {
        var config = {
            sources: [],
            externs: [],
            buildOptions: [],
            compilationUnits: {},
            next: {}
        };
    });

    xit('compile with config hierarchy', function () {
        // use relative paths

        var config = {
            sources: [],
            externs: [],
            buildOptions: [],
            compilationUnits: {},
            next: {}
        };
    });

    xit('compilation errors', function () {});
});
