import { logging } from "near-sdk-as";

@nearBindgen
export class Counter {
  private counter: i32 = 0;
  @mutateState()
  incrementCounter(value: i32): void {
    this.counter += value;
    logging.log("counter is incremented by" + value.toString());
  }
  @mutateState()
  decrementCounter(value: i32): void {
    this.counter -= value;
    logging.log("counter is decremented by" + value.toString());
  }
  
  getCounter(): i32 {
    return this.counter;
  }
  
  @mutateState()
  resetCounter(): void {
    this.counter = 0;
    logging.log("counter is reset");
  }
}