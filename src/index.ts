import * as crypto from 'node:crypto'
import type { TSpec } from './utils'

import {
  base58decode,
  cryptoSettings,
  deriveKey,
  stringToArraybuffer,
  zlibInflate,
} from './utils'

export interface DecryptOptions {
  key: string
  data: (string | number | (string | number)[])[]
  cipherMessage: string
  password?: string
}

export async function decryptPrivateBin({ key, password, data, cipherMessage }: DecryptOptions) {
  key = base58decode(key).padStart(32, '\u0000')
  const spec = data[0] as TSpec
  const additionalDataString = JSON.stringify(data)

  spec[0] = atob(spec[0])
  spec[1] = atob(spec[1])

  const genCryptoSettings = cryptoSettings({
    adata: additionalDataString,
    spec,
  })

  const genKey = await deriveKey(key, spec, password)

  const decryptData = await crypto.subtle.decrypt(
    genCryptoSettings,
    genKey,
    stringToArraybuffer(
      atob(cipherMessage),
    ),
  )

  const inflated = await zlibInflate(decryptData)

  const { paste } = JSON.parse(inflated) as { paste: string }
  return paste
}
