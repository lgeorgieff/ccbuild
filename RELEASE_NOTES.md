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