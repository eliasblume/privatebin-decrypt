import { expect, it } from 'vitest'
import { decryptPrivateBin } from '../src'
import { adata, ct } from './test_data.json'
import { adata as adata_pw, ct as ct_pw } from './test_data_password.json'

it('decryption', async () => {
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
