import { expect, it } from 'vitest'
import { decryptPrivateBin } from '../src'
import { adata, ct } from './test_data.json'
import { adata as adata_pw, ct as ct_pw } from './test_data_password.json'

it('fetch & decrypt', async () => {
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

  expect(decrypted).toEqual(
    'Hello PrivateBin',
  )
})

it('simple decrypt', async () => {
  const key = 'C5p9j1YkFQ2uxdLxWqoo5hQ9G9bnbsLxNnFZ14MtppRy'
  expect(await decryptPrivateBin({
    key,
    data: adata,
    cipherMessage: ct,
  })).toEqual('Hello World')
})

it('decryption with password', async () => {
  const key = 'HQfzh1XPjqzbrcyW6KCQXyS7ABCU5U1JohYV1y2YggB4'
  const password = 'test'
  expect(await decryptPrivateBin({
    key,
    password,
    data: adata_pw,
    cipherMessage: ct_pw,
  })).toEqual('Password Hello World ')
})
