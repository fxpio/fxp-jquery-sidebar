Getting Started
===============

Prerequisites
-------------

This library require:

- jquery
- hammerjs
- font-awesome (optional, for toggle button)
- sonatra-hammer-scroll (optional)
- bootstrap (optional)

Installation
------------

Installation is a quick:

Add library in your `bower.json`:

```json
{
    "dependencies": {
        "sonatra-jquery-sidebar": "latest"
    }
}
```

Launch bower:

```bash
$ bower install
```

Dev installation
----------------

### Use NPM

```
npm install
```

### Use Bower

```
bower install
```

### Use grunt

```
grunt serve
```

### Twitter Bootstrap

You can use the specific stylesheet for twitter bootstrap (optional): `less/sidebar-bootstrap.less`.

##### For fixed navbar:

You must used:
- `.sidebar-fixed-top` class on sidebar element (`.sidebar`)
- `.container-fixed-top` class on content container element (`.container-main`) for top navbar
- `.container-fixed-bottom` class on content container element (`.container-main`) for bottom navbar

##### For static navbar:

You must used:
- `.sidebar-static-top` class on sidebar element (`.sidebar`)
- `.container-static-top` class on content container element (`.container-main`) for top navbar
- `.container-static-bottom` class on content container element (`.container-main`) for bottom navbar

##### For sidebar force open option:

You must used:

- `.sidebar-force-open` and `.sidebar-open-init` (optional) classes on sidebar element (`.sidebar`)
- `.container-force-open-left` class on content container element (`.container-main`) for the left position
- `.container-force-open-right` class on content container element (`.container-main`) for the right position

##### For sidebar locked option:

You must used:

- `.sidebar-locked` and `.sidebar-open-init` (optional) classes on sidebar element (`.sidebar`)
- `.container-force-open-left` class on content container element (`.container-main`) for the left position
- `.container-force-open-right` class on content container element (`.container-main`) for the right position
- `.sidebar-locked-toggle` class on toggle button element (optional)
