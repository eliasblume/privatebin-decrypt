import * as crypto from 'node:crypto'
import zlib from 'node:zlib'
import { base58 } from '@scure/base'

export type TSpec = [
  // initialization vector
  string,
  // salt
  string,
  // iterations
  number,
  // key size
  number,
  // tag length
  number,
  // algorithm (aes)
  string,
  // mode (gcm)
  string,
  // compression (rawdeflate)
  string,
]

export function stringToArraybuffer(message: string) {
  const messageArray = new Uint8Array(message.length)
  for (let i = 0; i < message.length; ++i)
    messageArray[i] = message.charCodeAt(i)

  return messageArray
}

export function utf16To8(message: string) {
  return encodeURIComponent(message).replace(
    /%([0-9A-F]{2})/g,
    (match, hexCharacter: string) => {
      return String.fromCharCode(Number(`0x${hexCharacter}`))
    },
  )
}

export function utf8To16(message: string) {
  return decodeURIComponent(
    message.split('').map(
      (character) => {
        return `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`
      },
    ).join(''),
  )
}

export const base58decode = function (input: string) {
  return arraybufferToString(
    base58.decode(input),
  )
}

export function arraybufferToString(messageArray: ArrayBuffer) {
  const array = new Uint8Array(messageArray)
  let message = ''
  let i = 0
  while (i < array.length)
    message += String.fromCharCode(array[i++])

  return message
}

interface ICryptoSettings {
  spec: TSpec
  adata: string
}

export function cryptoSettings({ spec, adata }: ICryptoSettings) {
  return {
    name: `AES-${spec[6].toUpperCase()}`, // can be any supported AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH" or "HMAC")
    iv: stringToArraybuffer(spec[0]), // the initialization vector you used to encrypt
    additionalData: stringToArraybuffer(adata), // the addtional data you used during encryption (if any)
    tagLength: spec[4], // the length of the tag you used to encrypt (if any)
  }
}

export async function deriveKey(key: string, spec: TSpec, password?: string) {
  let keyArray = stringToArraybuffer(key)
  if (password) {
    // version 1 pastes did append the passwords SHA-256 hash in hex
    if (spec[7] === 'rawdeflate') {
      const passwordBuffer = (await crypto.subtle.digest(
        { name: 'SHA-256' },
        stringToArraybuffer(
          utf16To8(password),
        ),
      ).catch(() => { console.error('Error while hashing password') })) as ArrayBuffer
      password = Array.prototype.map.call(
        new Uint8Array(passwordBuffer),
        x => (`00${x.toString(16)}`).slice(-2),
      ).join('')
    }
    const passwordArray = stringToArraybuffer(password)
    const newKeyArray = new Uint8Array(keyArray.length + passwordArray.length)
    newKeyArray.set(keyArray, 0)
    newKeyArray.set(passwordArray, keyArray.length)
    keyArray = newKeyArray
  }

  // import raw key
  const importedKey = (await crypto.subtle.importKey(
    'raw', // only 'raw' is allowed
    keyArray,
    { name: 'PBKDF2' }, // we use PBKDF2 for key derivation
    false, // the key may not be exported
    ['deriveKey'], // we may only use it for key derivation
  ).catch(() => { console.error('Error while importing key') })) as crypto.webcrypto.CryptoKey

  // derive a stronger key for use with AES
  return ((crypto.subtle.deriveKey(
    {
      name: 'PBKDF2', // we use PBKDF2 for key derivation
      salt: stringToArraybuffer(spec[1]), // salt used in HMAC
      iterations: spec[2], // amount of iterations to apply
      hash: { name: 'SHA-256' }, // can be "SHA-1", "SHA-256", "SHA-384" or "SHA-512"
    },
    importedKey,
    {
      name: `AES-${spec[6].toUpperCase()}`, // can be any supported AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH" or "HMAC")
      length: spec[3], // can be 128, 192 or 256
    },
    false, // the key may not be exported
    ['encrypt', 'decrypt'], // we may only use it for en- and decryption
  ).catch(() => { console.error('Error while deriving key') })) as unknown as crypto.webcrypto.CryptoKey)
}

export async function zlibInflate(data: ArrayBuffer) {
  return await new Promise<string>((resolve) => {
    zlib.inflateRaw(new Uint8Array(data), (_, buffer) => {
      resolve(utf8To16(
        arraybufferToString(buffer),
      ))
    })
  })
}
