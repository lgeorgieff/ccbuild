# Version 2.2.2
* Update the dependencies
  * google-closure-compiler to version ^20170521.0.0
  * read-package-json to version ^2.0.5
  * q to version ^1.5.0
  * glob to version ^7.1.2
  * async to version ^2.4.1
* Update the devDependencies
  * rimraf to version ^2.6.1
  * proxyquire to version ^1.8.0
  * jsdoc to version ^3.4.3
  * jasmine to version ^2.6.0
  * mock-fs to version ^4.4.1

# Version 2.2.1
* Adapt usage information to latest changes

# Version 2.2.0
* Implement a build cache that prevents recompiling unchanged compilation units
* Refactor unit and system tests in clean up fixtures
* Enable all pending unit tests

# Version 2.1.8
* Fix a bug with the checkFs implementation when using ignore

# Version 2.1.7
* Fix a bug the checkFs implementation

# Version 2.1.6
* Fix a bug the checkFs implementation
* Add more information to checkFs into README.md

# Version 2.1.5
* Fix a bug with --stop-on-warning

# Version 2.1.4
* Add unit tests for WarningsFilterProcessor
* Add parameter checks to WarningsFilterProcessor

# Version 2.1.3
* Add unit tests for GCCResultProcessor
* Add parameter checks to GCCResultProcessor

# Version 2.1.2
* Add unit tests for GCCMessage
* Fix bugs in GCCMessage

# Version 2.1.1
* Update example of configuration file in README.md

# Version 2.1.0
* Add WarningsFilterFile functionality
* Fix format of RELEASE_NOTES.md
* Fix license text

# Version 2.0.1
* Fix license text

# Version 2.0.0
* All files in config files are handled with relative paths instead of absolute paths
* chdir is not called before a compilation unit is compiled, this now leads to a problem when settings relative paths in buildOptions, e.g. for flag files. These options must be set relative to the CWD of the node process
