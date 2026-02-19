summary:

index.html ends up with NOTHING but

```html
  <div id="interference-demo"></div>
  <script src="interference.js"></script>
```

jsx files import dependencies the top, like react or lit.js

```js
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
```

you have to install those dependencies somehow in your local node_modules folder

```sh
npm install react react-dom
```

so that... when you build, the bundler/transpiler (e.g. esbuild) knows where
to find the source for react.

Finally, build the .jsx -> .js file with `--bundle`

```sh
npx esbuild interference.jsx --bundle --outfile=interference.js
```


(note, that `npm install` will create a package.json ... that's the equivalent pyproject.toml)

you should save that file, so that when you clone your repo to some other computer,
you just  run `npm install`

