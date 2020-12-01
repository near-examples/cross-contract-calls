import { VM } from "near-sdk-as";
import * as contract from '../assembly'

describe("00.orientation", () => {

  describe('Remote interface', () => {
    describe('do_some_work()', () => {
      it('does some work and returns a result', () => {
        expect(contract.do_some_work()).toBe('some result')
      })
    })
  })

})
