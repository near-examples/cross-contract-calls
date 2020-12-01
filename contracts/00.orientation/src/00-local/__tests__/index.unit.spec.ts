import { VM } from "near-sdk-as";
import * as contract from '../assembly'

describe("00.orientation", () => {

  describe('Local interface', () => {
    describe('xcc()', () => {
      it('does not blow up on high level calls', () => {
        expect(() => {
          contract.xcc('high', 'remote', 'do_some_work')
        }).not.toThrow()
      })
      it('does not blow up on mid level calls', () => {
        expect(() => {
          contract.xcc('mid', 'remote', 'do_some_work')
        }).not.toThrow()
      })
      it('does not blow up on low level calls', () => {
        expect(() => {
          contract.xcc('low', 'remote', 'do_some_work')
        }).not.toThrow()
      })

    })
  })

})
