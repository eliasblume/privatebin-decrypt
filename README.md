# privatebin-decrypt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A simple library to decrypt PrivateBin pastes for nodejs

## Install

```bash
npm install privatebin-decrypt
```

## Usage

```ts
import { decryptPrivateBin } from 'privatebin-decrypt'

// https://paste.to/?2f1ecdd195e92055#3evZwExja1XBjXY6gCPkpmodFy6LKNLre75VHCY9sz5f
const data = await (await fetch('https://paste.to/?2f1ecdd195e92055', {
  headers: {
    Accept: 'application/json, text/javascript, */*; q=0.01',
  },
})).json() as {
  ct: string
  adata: (string | number | (string | number)[])[]
}

const key = '3evZwExja1XBjXY6gCPkpmodFy6LKNLre75VHCY9sz5f'
const decrypted = await decryptPrivateBin({
  key,
  data: data.adata,
  cipherMessage: data.ct,
})

console.log(decrypted)
// Hello PrivateBin
```


## License

[MIT](./LICENSE) License © 2023-PRESENT [Elias Blume](https://github.com/eliasblume)


<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/privatebin-decrypt?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/privatebin-decrypt
[npm-downloads-src]: https://img.shields.io/npm/dm/privatebin-decrypt?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/privatebin-decrypt
[bundle-src]: https://img.shields.io/bundlephobia/minzip/privatebin-decrypt?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=privatebin-decrypt
[license-src]: https://img.shields.io/github/license/eliasblume/privatebin-decrypt.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/eliasblume/privatebin-decrypt/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/privatebin-decrypt
