import {
  FLIPBOOK_FRAMES_LOADED
} from '../constants/actionTypes'

const mockFrames = [{
  number: 0,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 1,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 2,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 3,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 4,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 5,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 6,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}, {
  number: 7,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 8,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 9,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 10,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 11,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 12,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 13,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 14,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 15,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 16,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}, {
  number: 17,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 18,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 19,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 20,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 21,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 22,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 23,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 24,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 25,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 26,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}, {
  number: 27,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 28,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 29,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 30,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 31,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 32,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 33,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 34,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 35,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 3,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}, {
  number: 37,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 38,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 39,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 40,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 41,
  url: 'https://test.pool.zorroa.com/api/v1/assets/86cf3538-9f77-5b1b-be36-107bf502e28e/proxies/atLeast/282'
}, {
  number: 42,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 43,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 44,
  url: 'https://test.pool.zorroa.com/api/v1/assets/39a905ae-2bdb-5a81-bf66-2162b223baa8/proxies/atLeast/282'
}, {
  number: 45,
  url: 'https://test.pool.zorroa.com/api/v1/assets/00e88ee8-af80-5ec0-9504-af9fcb8f31d8/proxies/atLeast/282'
}, {
  number: 46,
  url: 'https://test.pool.zorroa.com/api/v1/assets/52384f88-b29e-5595-8c23-c8c5db19ae86/proxies/atLeast/282'
}, {
  number: 47,
  url: 'https://test.pool.zorroa.com/api/v1/assets/20bf0d19-66dd-5f87-8def-b3db9ac6727b/proxies/atLeast/282'
}, {
  number: 48,
  url: 'https://test.pool.zorroa.com/api/v1/assets/a15f0d3e-cc0d-5701-9435-a8030077f5f2/proxies/atLeast/282'
}, {
  number: 100,
  url: 'https://test.pool.zorroa.com/api/v1/assets/13233b7e-7833-5484-b8ae-61c81c9d8a54/proxies/atLeast/282'
}]

const initialState = {
  frames: mockFrames
}

export default function (state = initialState, action) {
  switch (action.type) {
    case FLIPBOOK_FRAMES_LOADED: {
      const frames = action.payload
      return {
        ...state,
        frames
      }
    }
  }

  return state
}
