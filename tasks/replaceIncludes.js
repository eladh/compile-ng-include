'use strict';

module.exports = function (grunt) {

var jsdom = require('jsdom-nogyp');
var jquery = require('jquery');
    
    function fixPath(path) {
        if (typeof path =='string') {
            return path.match(/.*\/$/) ? path : path + '/';
        }
        else {
            return path;
        }
    }

    function getStaticIncludes(baseUrl, src, filePath, $){
        var includes = $("ng-include, [ng-include]");
        var staticIncludes = [];
        if(includes.length > 0){
            for(var i = includes.length - 1; i >= 0; i--) {
                var templateSrc = $(includes[i]).attr('src')||$(includes[i]).attr('ng-include');
                templateSrc = templateSrc.replace(/['"]/g, "");

                if(templateSrc.match(/\.\/.+\.html$/)) {
                    var url = getSrc(baseUrl, src, templateSrc);
                    staticIncludes.push({
                        template: includes[i],
                        url: url
                    })
                }
                else {
                    grunt.log.error('skipped: ', templateSrc, 'in file: ', filePath, '\n');
                }
            }
        }
        return staticIncludes;
    }

    function getSrc(baseUrl, src, templateSrc){
        var url = baseUrl + src + templateSrc;
        if(url.indexOf('../') == -1){
            url = url.replace('./', '');
        }
        return url;
    }

    grunt.registerTask('replaceIncludes', 'Replace ng-includes', function () {
        var done = this.async();
        var dist = grunt.config.get('replaceIncludes').dist;
        var baseUrl = (dist.baseUrl == '') ? '' : fixPath(dist.baseUrl);
        var dest = fixPath(dist.dest);
        dist.src.forEach(function(singleSrc){
            var src = fixPath(singleSrc);
            var files = grunt.file.expand(baseUrl + src + dist.pattern);
            if(files != ''){
                files.forEach(function (filePath) {
                var file = grunt.file.read(filePath);
                testForIncludes(file, filePath, src);
                });
            }
            else {
                grunt.log.write('There are no files to compile! \n', baseUrl + src + dist.pattern)
            }
        });
		
		done(true);

        function testForIncludes(file, filePath, src) {
            jsdom.env(
                file,
                function (errors, window) {
                    var $ = jquery(window);
                    var staticIncludes = getStaticIncludes(baseUrl, src, filePath, $);
                    if (staticIncludes.length !== 0){
                        for(var i in staticIncludes){
                            var includeUrl = staticIncludes[i].url;

                            if (!grunt.file.exists(includeUrl)) {
                                grunt.log.warn('Source file "' + includeUrl + '" included into "' + filePath + '" not found.\n');
                                return false;
                            } else {
                                var ngContent = grunt.file.read(includeUrl);
                                if($(staticIncludes[i].template)[0].tagName === 'NG-INCLUDE'){
                                    $(staticIncludes[i].template).replaceWith('\n<!-- included template: ' + includeUrl + ' -->\n' + ngContent + '\n<!-- end of included template: ' + includeUrl + ' -->\n');
                                }
                                else {
                                    $(staticIncludes[i].template)
                                        .removeAttr('ng-include')
                                        .removeAttr('src')
                                        .append('\n<!-- included template: ' + includeUrl + ' -->\n' + ngContent + '\n<!-- end of included template: ' + includeUrl + ' -->\n');
                                }
                                grunt.log.write('included: ', includeUrl, '\n')
                            }

                        }
                        file = window.document.body.innerHTML;
                        testForIncludes(file, filePath, src);
                    }
                    else {
                        if (!dest) {                           // replace source files with compiled ones
                            grunt.file.write(filePath, file);
                        }
                        else if (typeof dest == 'function'){   // custom destination path
                            var target = dist.dest(filePath);
                            grunt.file.write(target, file);
                        }
                        else {                                      // write compiled files to target folder
                            var target = filePath.replace(src, dest);
                            grunt.file.write(target, file);
                        }
                    }
                }
            );
        }
    });
};

