/* Bindings typescript generated by archetype version: 1.2.14 */

import { registerEvent, Event, EventProcessor, EventData } from '../src';
import BigNumber from 'bignumber.js';

/* Event: TestEvent */

export interface TestEvent extends Event {
  ival : BigNumber,
  sval : string
}

const is_TestEvent = (t : string) => {
  return t === 'TestEvent'
}

const handle_TestEvent = (handler : EventProcessor<TestEvent>) => (event : any, data ?: EventData) => {
  handler({ival : event.args[0].int,
           sval : event.args[1].string}, data)
}

export function register_TestEvent(source : string, handler : EventProcessor<TestEvent>) {
  registerEvent({ source: source, filter: is_TestEvent, process: handle_TestEvent(handler) })
}
