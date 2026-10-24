import { mock } from 'bun:test'
import { mockReactNative } from './react-native-mock'
import { universityApiMock } from './university-api-mocks'
import { storageMock } from './university-storage-mocks'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

mockReactNative()

// Register shared mocks first so sticky Bun mock.module always has complete exports.
mock.module(`${SRC_ROOT}utils/storage.ts`, () => storageMock)
mock.module('@/utils/storage', () => storageMock)
mock.module(`${SRC_ROOT}api/university-api.ts`, () => universityApiMock)
mock.module('@/api/university-api', () => universityApiMock)
