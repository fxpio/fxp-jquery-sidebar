/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Encore = require('@symfony/webpack-encore');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = Encore
    .setOutputPath('build/')
    .setPublicPath('/build')
    .autoProvidejQuery()
    .enableSourceMaps(!Encore.isProduction())
    .cleanupOutputBeforeBuild()
    .enableLessLoader()
    .addEntry('main', './examples/main.js')
    .addPlugin(new CopyWebpackPlugin([
        { from: './examples', to: '.', test: /.html$/ }
    ]))
    .getWebpackConfig()
;

// Replace Webpack Uglify Plugin
if (Encore.isProduction()) {
    config.plugins = config.plugins.filter(
        plugin => !(plugin instanceof webpack.optimize.UglifyJsPlugin)
    );
    config.plugins.push(new UglifyJsPlugin());
}

module.exports = config;
