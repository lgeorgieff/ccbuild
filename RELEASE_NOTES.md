= Version 2.0.0 =
* All files in config files are handled with relative paths instead of absolute paths
* chdir is not called before a compilation unit is compiled, this now leads to a problem when settings relative paths in buildOptions, e.g. for flag files. These options must be set relative to the CWD of the node process