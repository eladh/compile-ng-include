# compile-ng-include

> common tasks for building client modules

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install idi-compile-ng-include --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('compile-ng-include');
```

module.exports = function (grunt) {

    grunt.initConfig({
        replaceIncludes: {
            dist: {
                baseUrl: 'test/',
                src: 'src2/',
                pattern: '**/*.html'
            }
        }
    });

    grunt.loadTasks('tasks/');
};
