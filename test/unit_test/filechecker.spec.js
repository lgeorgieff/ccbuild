'use strict';

/**
 * @ignore
 * @suppress {dupicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {dupicate}
 */
var mockFs = require('mock-fs');

/**
 * @ignore
 * @suppress {dupicate}
 */
var FileChecker = require('../../src/FileChecker.js');

describe('Class FileChecker', function () {
    var allFiles = [
        path.join('dir-1', 'file1.js'),
        path.join('dir-1', 'file2.js'),
        path.join('dir-1', 'file3.txt'),
        path.join('dir-1', 'dir-1-1', 'file4.json'),
        path.join('dir-1', 'dir-1-1', 'file5.json'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'file6.cpp'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'file7.py'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-1', 'file33.cs'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'file6.cpp'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'file7.py'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-1', 'file55'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-3', 'file18.cs'),
        path.join('dir-1', 'dir-1-2', 'file4.json'),
        path.join('dir-1', 'dir-1-2', 'file5.json'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'file6.cpp'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'file7.py'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'dir-1-2-1-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'dir-1-2-1-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'file6.cpp'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'file7.py'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'dir-1-2-2-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'dir-1-2-2-2', 'file8.txt'),
        path.join('dir-2', 'file1.js'),
        path.join('dir-2', 'file2.js'),
        path.join('dir-2', 'file3.txt'),
        path.join('dir-2', 'dir-2-1', 'file4.json'),
        path.join('dir-2', 'dir-2-1', 'file5.json'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'file6.cpp'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'file7.py'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'dir-2-1-1-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'dir-2-1-1-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'file6.cpp'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'file7.py'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'dir-2-1-2-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'dir-2-1-2-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'file4.json'),
        path.join('dir-2', 'dir-2-2', 'file5.json'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'file6.cpp'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'file7.py'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'dir-2-2-1-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'dir-2-2-1-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'file6.cpp'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'file7.py'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'dir-2-2-2-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'dir-2-2-2-2', 'file8.txt')
    ];

    beforeAll(function () {
        var fakeFs = {
            'dir-1': {
                'file1.js': '',
                'file2.js': '',
                'dir-1-1': {
                    'file4.json': '',
                    'dir-1-1-1': {
                        'file6.cpp': '',
                        'dir-1-1-1-1': {
                            'file8.txt': '',
                            'file33.cs': ''
                        },
                        'file7.py': '',
                        'dir-1-1-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-1-1-2': {
                        'file6.cpp': '',
                        'dir-1-1-2-1': {
                            'file8.txt': '',
                            'file55': ''
                        },
                        'file7.py': '',
                        'dir-1-1-2-2': {
                            'file8.txt': ''
                        },
                        'dir-1-1-2-3': {
                            'file18.cs': ''
                        }
                    },
                    'file5.json': ''
                },
                'file3.txt': '',
                'dir-1-2': {
                    'file4.json': '',
                    'dir-1-2-1': {
                        'file6.cpp': '',
                        'dir-1-2-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-1-2-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-1-2-2': {
                        'file6.cpp': '',
                        'dir-1-2-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-1-2-2-2': {
                            'file8.txt': ''
                        }
                    },
                    'file5.json': ''
                }
            },
            'dir-2': {
                'file1.js': '',
                'file2.js': '',
                'dir-2-1': {
                    'file4.json': '',
                    'dir-2-1-1': {
                        'file6.cpp': '',
                        'dir-2-1-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-1-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-2-1-2': {
                        'file6.cpp': '',
                        'dir-2-1-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-1-2-2': {
                            'file8.txt': ''
                        }
                    },
                    'file5.json': ''
                },
                'file3.txt': '',
                'dir-2-2': {
                    'file4.json': '',
                    'dir-2-2-1': {
                        'file6.cpp': '',
                        'dir-2-2-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-2-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-2-2-2': {
                        'file6.cpp': '',
                        'dir-2-2-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-2-2-2': {
                            'file8.txt': ''
                        },
                        'dir-2-2-3': {}
                    },
                    'file5.json': ''
                }
            }
        };

        mockFs(fakeFs);
    });

    afterAll(mockFs.restore);

    describe('contructor', function () {
        it('throws an error in case no option is present in constructor', function () {
            expect(function () {
                new FileChecker({filesToCheck: null, filesToIgnore: null, filesInUnits: null, fileExtensions: null});
            }).toThrowError(Error);
        });

        it('throws an error in case filesToCheck option is bad in constructor', function () {
            expect(function () {
                new FileChecker({filesToCheck: null, filesToIgnore: [], filesInUnits: [], fileExtensions: []});
            }).toThrowError(Error);
        });

        it('throws an error in case fileExtensions parameter is bad in constructor', function () {
            expect(function () {
                new FileChecker({filesToCheck: [], filesToIgnore: null, filesInUnits: [], fileExtensions: []});
            }).toThrowError(Error);
        });

        it('throws an error in case filesToIgnore parameter is bad in constructor', function () {
            expect(function () {
                new FileChecker({filesToCheck: [], filesToIgnore: [], filesInUnits: null, fileExtensions: []});
            }).toThrowError(Error);
        });

        it('throws an error in case filesInUnits parameter is bad in constructor', function () {
            expect(function () {
                new FileChecker({filesToCheck: [], filesToIgnore: [], filesInUnits: [], fileExtensions: null});
            }).toThrowError(Error);
        });

        it('creates an instance of FileChecker if all arguments are present', function () {
            expect(new FileChecker({filesToCheck: [], filesToIgnore: [], filesInUnits: [], fileExtensions: []}))
                .toEqual(jasmine.any(FileChecker));
        });
    });

    describe('if constructed properly', function () {
        it('signals verificationDone in case no files need to be checked', function (done) {
            var fc = new FileChecker(
                {filesToCheck: ['dir-3'], filesToIgnore: [], filesInUnits: [], fileExtensions: []});
            fc.on('verificationSuccess', function (f) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });
            fc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            fc.on('verificationDone', function () {
                setTimeout(done, 1000);
            });
        });

        it('signals verificationDone in case all files have been checked', function (done) {
            var fc = new FileChecker(
                {filesToCheck: ['dir-2'], filesToIgnore: [], filesInUnits: ['dir-2'], fileExtensions: []});
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
            var dir2Files = allFiles.filter(function (file) {
                var splits = file.split(path.sep);
                return splits.length > 0 && splits[0] === 'dir-2';
            });

            fc.on('verificationSuccess', verificationSuccessHandler);
            fc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            fc.on('verificationDone', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(dir2Files.length);
                dir2Files.forEach(function (dir2File) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(dir2File);
                });
                done();
            });
        });

        it('signals verificationError in case a file is not in the compilation units', function (done) {
            var allDir2Files = allFiles.filter(function (file) {
                var splits = file.split(path.sep);
                return splits.length > 0 && splits[0] === 'dir-2';
            });
            var filesInUnits = allDir2Files.slice(0, allDir2Files.length - 1);
            var filesNotInUnits = allDir2Files.slice(allDir2Files.length - 1);

            var fc = new FileChecker(
                {filesToCheck: ['dir-2'], filesToIgnore: [], filesInUnits: filesInUnits, fileExtensions: []});
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
            var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');

            fc.on('verificationSuccess', verificationSuccessHandler);
            fc.on('verificationError', verificationErrorHandler);
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            expect(filesNotInUnits.length).toBe(1);
            expect(filesInUnits.length).toBeGreaterThan(0);
            expect(filesInUnits.length).toBe(allDir2Files.length - 1);
            fc.on('verificationDone', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                filesInUnits.forEach(function (fileInUnit) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(fileInUnit);
                });
                expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                filesNotInUnits.forEach(function (fileNotInUnit) {
                    expect(verificationErrorHandler).toHaveBeenCalledWith(fileNotInUnit);
                });
                done();
            });
        });

        it('signals verificationError in case multiple files are not in the compilation units', function (done) {
            var allDir2Files = allFiles.filter(function (file) {
                var splits = file.split(path.sep);
                return splits.length > 0 && splits[0] === 'dir-2';
            });
            var filesInUnits = allDir2Files.slice(0, allDir2Files.length - (allDir2Files.length / 2));
            var filesNotInUnits = allDir2Files.slice(allDir2Files.length - (allDir2Files.length / 2));

            var fc = new FileChecker(
                {filesToCheck: ['dir-2'], filesToIgnore: [], filesInUnits: filesInUnits, fileExtensions: []});
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
            var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');

            fc.on('verificationSuccess', verificationSuccessHandler);
            fc.on('verificationError', verificationErrorHandler);
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            expect(filesNotInUnits.length).toBeGreaterThan(0);
            expect(filesInUnits.length).toBeGreaterThan(0);
            expect(filesInUnits.length + filesNotInUnits.length).toBe(allDir2Files.length);
            fc.on('verificationDone', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                filesInUnits.forEach(function (fileInUnit) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(fileInUnit);
                });
                expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                filesNotInUnits.forEach(function (fileNotInUnit) {
                    expect(verificationErrorHandler).toHaveBeenCalledWith(fileNotInUnit);
                });
                done();
            });
        });

        it('does not signal a verificationError in case files are listed in the ignored files', function (done) {
            var allDir2Files = allFiles.filter(function (file) {
                var splits = file.split(path.sep);
                return splits.length > 0 && splits[0] === 'dir-2';
            });
            var filesInUnits = allDir2Files.slice(0, allDir2Files.length - (allDir2Files.length / 2));
            var ignoredFiles = allDir2Files.slice(allDir2Files.length - (allDir2Files.length / 2));

            var fc = new FileChecker(
                {filesToCheck: ['dir-2'], filesToIgnore: ignoredFiles, filesInUnits: filesInUnits, fileExtensions: []});
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');

            fc.on('verificationSuccess', verificationSuccessHandler);
            fc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            expect(ignoredFiles.length).toBeGreaterThan(0);
            expect(filesInUnits.length).toBeGreaterThan(0);
            expect(filesInUnits.length + ignoredFiles.length).toBe(allDir2Files.length);
            fc.on('verificationDone', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                filesInUnits.forEach(function (fileInUnit) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(fileInUnit);
                });
                done();
            });
        });

        it('does not signal a verificationError in case a file is in a folder that is ignored', function (done) {
            var fc = new FileChecker(
                {filesToCheck: ['dir-2'], filesToIgnore: ['dir-2'], filesInUnits: [], fileExtensions: []});
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
            fc.on('verificationSuccess', verificationSuccessHandler);
            fc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            fc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            fc.on('verificationDone', function () {
                expect(verificationSuccessHandler).not.toHaveBeenCalled();
                done();
            });
        });

        it('does not signal a verificationError in case a file extension is not listed in the file extensions list',
           function (done) {
               var filesInUnits = allFiles.filter(function (f) {
                   return path.extname(f) === '.js' || path.extname(f) === '.json';
               });

               var fc = new FileChecker({filesToCheck: ['.'],
                                         filesToIgnore: [],
                                         filesInUnits: filesInUnits,
                                         fileExtensions: ['.js', '.json']});
               var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
               fc.on('verificationSuccess', verificationSuccessHandler);
               fc.on('verificationError', function (f) {
                   fail('Did not expect "verificationError" to be fired!');
               });
               fc.on('error', function (err) {
                   fail('Did not expect "error" to be fired!');
               });

               fc.on('verificationDone', function () {
                   expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                   filesInUnits.forEach(function (f) {
                       expect(verificationSuccessHandler).toHaveBeenCalledWith(f);
                   });
                   done();
               });
           });

        it('does not signal a verificationError in case a file is included in a directory set as filesInUnits',
           function (done) {
               var filesInUnits = allFiles.filter(function (f) {
                   return path.extname(f) === '.js' || path.extname(f) === '.json';
               });

               var fc = new FileChecker({filesToCheck: ['.'],
                                         filesToIgnore: [],
                                         filesInUnits: ['dir-1', 'dir-2'],
                                         fileExtensions: ['.js', '.json']});
               var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
               fc.on('verificationSuccess', verificationSuccessHandler);
               fc.on('verificationError', function (f) {
                   fail('Did not expect "verificationError" to be fired!');
               });
               fc.on('error', function (err) {
                   fail('Did not expect "error" to be fired!');
               });

               fc.on('verificationDone', function () {
                   expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                   filesInUnits.forEach(function (f) {
                       expect(verificationSuccessHandler).toHaveBeenCalledWith(f);
                   });
                   done();
               });
           });

        it('signals a verificationError in case a file extension is listed in the file extensions list',
           function (done) {
               var filteredFiles = allFiles.filter(function (f) {
                   return path.extname(f) === '.js' || path.extname(f) === '.json';
               });
               var filesInUnits = filteredFiles.slice(0, filteredFiles.length / 2);
               var filesNotInUnits = filteredFiles.slice(filteredFiles.length / 2);
               expect(filteredFiles.length).toBe(filesInUnits.length + filesNotInUnits.length);

               var fc = new FileChecker({filesToCheck: ['.'],
                                         filesToIgnore: [],
                                         filesInUnits: filesInUnits,
                                         fileExtensions: ['.js', '.json']});
               var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
               var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');
               fc.on('verificationSuccess', verificationSuccessHandler);
               fc.on('verificationError', verificationErrorHandler);
               fc.on('error', function (err) {
                   fail('Did not expect "error" to be fired!');
               });

               fc.on('verificationDone', function () {
                   expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                   filesInUnits.forEach(function (f) {
                       expect(verificationSuccessHandler).toHaveBeenCalledWith(f);
                   });
                   expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                   filesNotInUnits.forEach(function (f) {
                       expect(verificationErrorHandler).toHaveBeenCalledWith(f);
                   });
                   done();
               });
           });

        it('does not signal a verificationError for files without extensions in case "" is not specified in file ' +
            'extensions', function (done) {
                var filesToCheck = allFiles.filter(function (f) {
                    return path.extname(f) === '.js' || path.extname(f) === '.json' || path.extname(f) === '';
                });
                var filesInUnits = filesToCheck.filter(function (f) {
                    return path.extname(f) === '.js' || path.extname(f) === '.json';
                });
                expect(filesToCheck.length).toBeGreaterThan(filesInUnits.length);

                var fc = new FileChecker({filesToCheck: filesToCheck,
                                          filesToIgnore: [],
                                          filesInUnits: filesInUnits,
                                          fileExtensions: ['.js', '.json']});
                var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
                fc.on('verificationSuccess', verificationSuccessHandler);
                fc.on('verificationError', function (f) {
                    fail('Did not expect "verificationError" to be fired!');
                });
                fc.on('error', function (err) {
                    fail('Did not expect "error" to be fired!');
                });

                fc.on('verificationDone', function () {
                    expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                    filesInUnits.forEach(function (f) {
                        expect(verificationSuccessHandler).toHaveBeenCalledWith(f);
                    });
                    done();
                });
            });

        it('signals a verificationError for files without extensions in case "" is specified in file extensions',
            function (done) {
                var filesToCheck = allFiles.filter(function (f) {
                    return path.extname(f) === '.js' || path.extname(f) === '.json' || path.extname(f) === '';
                });
                var filesInUnits = filesToCheck.filter(function (f) {
                    return path.extname(f) === '.js' || path.extname(f) === '.json';
                });
                var filesNotInUnits = filesToCheck.filter(function (f) {
                    return path.extname(f) === '';
                });
                expect(filesToCheck.length).toBeGreaterThan(filesInUnits.length);

                var fc = new FileChecker({filesToCheck: filesToCheck,
                                          filesToIgnore: [],
                                          filesInUnits: filesInUnits,
                                          fileExtensions: ['.js', '.json', '']});
                var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
                var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');
                fc.on('verificationSuccess', verificationSuccessHandler);
                fc.on('verificationError', verificationErrorHandler);
                fc.on('error', function (err) {
                    fail('Did not expect "error" to be fired!');
                });

                fc.on('verificationDone', function () {
                    expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                    filesInUnits.forEach(function (f) {
                        expect(verificationSuccessHandler).toHaveBeenCalledWith(f);
                    });
                    expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                    filesNotInUnits.forEach(function (f) {
                        expect(verificationErrorHandler).toHaveBeenCalledWith(f);
                    });
                    done();
                });
            });
    });

    describe('with no access to file system', function () {
        beforeAll(function () {
            var fakeFs = {
                'dir-3': mockFs.directory({mode: parseInt('222', 8),
                                           items: {
                                               'file.txt': ''
                                           }})
            };
            mockFs(fakeFs);
        });

        it('signals error in case a folder cannot be accessed', function (done) {
            var fc = new FileChecker(
                {filesToCheck: ['dir-3'], filesToIgnore: [], filesInUnits: [], fileExtensions: []});
            fc.on('verificationSuccess', function (f) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });
            fc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            fc.on('error', function (err) {
                expect(err).toEqual(jasmine.any(Error));
                expect(err.code).toBe('EACCES');
                done();
            });

            fc.on('verificationDone', function () {
                fail('Did not expect "verificationDone" to be fired!');
            });
        }, 2000);
    });
});
