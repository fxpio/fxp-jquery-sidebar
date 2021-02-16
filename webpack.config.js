/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Encore = require('@symfony/webpack-encore');

const config = Encore
    .setOutputPath('build/')
    .setPublicPath('/build')
    .disableSingleRuntimeChunk()
    .autoProvidejQuery()
    .enableSourceMaps(!Encore.isProduction())
    .cleanupOutputBeforeBuild()
    .enableSassLoader()
    .addEntry('main', './examples/main.js')
    .copyFiles({
        from: './examples',
        to: '[name].[ext]',
        pattern: /.html$/
    })
    .getWebpackConfig()
;

module.exports = config;
