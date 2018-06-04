/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import $ from 'jquery';

/**
 * Add browser prefix on event name for jquery.
 *
 * @param {String} name        The event name
 * @param {String} [namespace] The namespace of jquery event
 *
 * @returns {String}
 */
export function prefixedEvent(name, namespace) {
    let pfx = ['webkit', 'moz', 'ms', 'o', ''],
        names = '';

    for (let p = 0; p < pfx.length; p++) {
        if (!pfx[p]) {
            name = name.toLowerCase();
        }

        names += ' ' + pfx[p] + name;

        if (undefined !== namespace) {
            names += '.' + namespace;
        }
    }

    return names;
}

/**
 * Trigger the event.
 *
 * @param {String}  type   The event type
 * @param {Sidebar} self   The sidebar instance
 * @param {*}       [data] The data
 */
export function triggerEvent(type, self, data) {
    $.event.trigger({
        type: 'sidebar:' + type + '.fxp.sidebar',
        sidebar: self,
        eventData: data,
        time: new Date()
    });
}
