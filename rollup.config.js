/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

const baseConfig = {
    input: 'js/sidebar.js',
    external: [
        'jquery'
    ],
    plugins: [
        resolve(),
        commonjs({
            include: 'node_modules/@fxp/jquery-pluginify/**'
        }),
        babel({
            presets: [
                '@babel/preset-env'
            ]
        })
    ]
};

const iifeConfig = {
    ...baseConfig,
    output: {
        format: 'iife',
        name: 'FxpSidebar',
        exports: 'named',
        globals: {
            jquery: 'jQuery'
        }
    }
};

const uglifyConfig = {
    warnings: false,
    compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true
    }
};

export default [
    {
        ...iifeConfig,
        output: {
            ...iifeConfig.output,
            file: 'dist/sidebar.js'
        }
    },
    {
        ...iifeConfig,
        plugins: [...baseConfig.plugins, uglify(uglifyConfig)],
        output: {
            ...iifeConfig.output,
            file: 'dist/sidebar.min.js'
        }
    }
];
