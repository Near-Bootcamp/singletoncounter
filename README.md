# How To Write Smart Contract With Typescript, Part 2 - Singleton Counter
## Introduction
This is third tutorial in a series of tutorial which covers smart contract development in Assmeblyscript on NEAR protocol. If you haven't read previous tutorials, I'll suggest you to read them first.

In this tutorials, we will write smart contract with singleton class pattern. We have been using individual function to create smart contract but I wanted to show you different method to write smart contract.

## Prerequisites
To follow along with this tutorial, you need to know basic TypeScript or JavaScript.

You need NodeJS installed on your machine. If you don't have NodeJS, click here and install LTS version on your machine.

Install `near-cli` package with npm or yarn globally on your machine.

## Setting Up The Project
Unlike first tutorial, we are going to use create-near-app which creates blank project for us. It is an awesome tool for development created by folks at NEAR foundation.

To create a new NEAR project with default settings, you just need one command:
```bash
npx create-near-app singletoncounter
```
Now open `singletoncounter` directory in your code editor.

## What is Singleton Class Pattern?

If you're familiar with object oriented programming, you may have heard about singleton class pattern.

According Wikipedia,

 > The Singleton Pattern is a software design pattern that restricts the instantiation of a class to one "single" instance.

This is useful when exactly one object is needed to coordinate actions across the system. 

As we will use smart contract on the blockchain so singleton pattern helps us keep state same across whole system.

## Smart Contract

We will write our smart conract in `./contract/assembly/index.ts`. Let's open the file and remove all the content, then paste the following code snippet:

```js
import { logging } from "near-sdk-as";

@nearBindgen
export class Counter {
    private counter: i32 = 0;
  //incrementCounter method
  //decrementCounter method
  //getCounter method
  //resetCounter method
}
```

On line 1, we are importing the `logging` from `near-sdk-as`.

Then we created `Counter` class and initialized class variable called `counter` to `0`.

We also have applied `nearBindgen` class decrator to our `Counter` class. `nearBindgen` is used to serialize the class that it is applied to.

### incrementCounter method

Let's implement method to increment the counter.

Copy the following code and paste it in `index.ts`:

```ts
  @mutateState()
  incrementCounter(value: i32): void {
    this.counter += value;
    logging.log("counter is incremented by" + value.toString());
  }
```

Before the `incrementCounter` method we have used `mutateState` method decorator. If we're changing the state of the smart contract in any method then we have to add `mutateState` decorator to it.

`incrementCounter` takes `value` as an argument. we took that argument and added it to class variable `counter`. To use class varible, we need to use `this` keyword. `this` refers to the instance of the class.

At last, we are logging the message.

### Remaninig Methods

Remaining methods are similar to one we have created above. In every method, we are accessing the class variable using `this.counter` and then doing some action according what that method should do.

```ts
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
```

## Testing Smart Contract

Now that we have written counter smart contract, let's write some unit tests. These tests will be like standard unit tests in Javascript or Typescript. Thus if you have done any type of unit testing, you will get hang of this quickly.

We will write our unit tests in `main.spec.ts` which is inside of `__test__` directory. Open that file, clear all the content of that file and paste the following:
```ts
import {
  Counter
} from '..';

import { context, storage } from 'near-sdk-as';

let counter: Counter;

describe("Counter ", () => {

  beforeEach(() => {
    counter = new Counter();
  })

  it("should increment by one", () => {
      counter.incrementCounter(1);
      expect(counter.getCounter()).toBe(1, "counter should be one after a single increment.");
  });

  it("counter.getCounter is the same as reading from storage", () => {
      expect(storage.getPrimitive<i32>("counter", 0)).toBe(counter.getCounter(), "storage.getPrimitive<i32>(\"counter\", 0) = counter.getCounter()");
  });

  it("should decrement by one", () => {
      counter.incrementCounter(1);
      counter.decrementCounter(1);
      expect(counter.getCounter()).toBe(0, "counter should be zero after a single decrement.");
  });

  it("should be resetable", () => {
      counter.incrementCounter(1);
      counter.incrementCounter(1);
      counter.resetCounter(); // reset to zero
      expect(counter.getCounter()).toBe(0, "counter should be zero after it is reset."); 
  });
  
  it("should increment multiple times and decrement back to zero", () => {
      counter.incrementCounter(1);
      expect(counter.getCounter()).toBe(1, "0 + 1 = 1");
      counter.incrementCounter(3);
      expect(counter.getCounter()).toBe(4, "1 + 3 = 4");
      counter.decrementCounter(4);
      expect(counter.getCounter()).toBe(0, "4 - 4 = 0");
  });

  it("should be alic's account", () => {
      expect(context.contractName).toBe("alice");
  });
});
```
For every test, we are following AAA pattern i.e. Arrange, Act and Assert. In arrange section, we have code that is required to do particular test. Act section invokes the function that we want to test. Finally, assert section compares actual value with expectation and if not value are different then that test fails.

To better understand this, we will take a look at one of the test that is in `main.spec.ts`.
```ts
it("should increment by one", () => {
    // arrange

    //act
      counter.incrementCounter(1);

    //assert
      expect(getCounter()).toBe(1, "counter should be one after a single increment.");
  });
```
For this test, we don't need to arrange anything so that section is empty. As we are testing `incrementCounter` method of `Counter` class, we are calling that method with `1` passed as an argument.

Finally in assert section, we put passed expectation into `expect` function and used `toBe` assertion to check if value of counter is 1 or not. If expected value is equal to actual value the test will pass. 

If you have followed last tutorial where we created counter smart contract with individual functions instead of class, you may have seen the difference in tests. Here we have used `beforeEach` hook which setups preconditions for our tests.

```ts
  beforeEach(() => {
    counter = new Counter();
  })
```

Before every tests, we are creating new instance of `Counter`. This resets state of contract for every test.

To run all the tests, we need to change our dierctory to contract:
```bash
cd contract
```
Now run the following command in the terminal:
```bash
yarn test
```
You will get following output:
```bash
✔ assembly/__tests__/main.spec.ts Pass: 6 / 6 Todo: 0 Time: 15.333ms
  [Result]: ✔ PASS
   [Files]: 1 total
  [Groups]: 2 count, 2 pass
   [Tests]: 6 pass, 0 fail, 6 total
    [Time]: 16283.092ms
Done in 17.06s.
```

Deploying The Contract
To deploy our contract first we need to compile it to WASM binary. Go to `singletoncounter` directory:

```bash
cd ..
```
Run `build:contract` script:

```bash
yarn build:contract
```
This will create `out` directory which contains WASM file.

To deploy smart contract from CLI, we need to store keys for your account locally. To do that run following command in terminal:

```bash
near login
```
This will redirect you to NEAR Wallet requesting full access to your account. From here, select which account you would like an access key to. Then click allow, you will be asked to confirm this authorization by entering the account name. Once complete, you will now have your Access Key stored locally.

Next step, deploy the smart contract (replace YOUR_ACCOUNT_ID with your testnet account, ex. arwin.testnet):

```bash
yarn deploy:contract --accountId YOUR_ACCOUNT_ID --wasmFile ./out/main.wasm
```
We have deployed smart contract on NEAR testnet. This command deploys smart contract on given accountId. Every account can have one smart contract assosiated with it. Here we have deplyed smart contract to your account.

After successful deployment, you'll get following output:

```bash
$ near deploy --accountId YOUR_ACCOUNT_ID --wasmFile ./out/main.wasm
Starting deployment. Account id: YOUR_ACCOUNT_ID, node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org, file: ./out/main.wasm
Transaction Id F1CUNpuJWWyNnBxkTpD9rrXK8BbBDRRxMgiac8ni9wC7
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/F1CUNpuJWWyNnBxkTpD9rrXK8BbBDRRxMgiac8ni9wC7
Done deploying to YOUR_ACCOUNT_ID
Done in 12.16s.
```
## Interacting With Smart Contract From Terminal
We can interact with our deployed smart contract from terminal using `near-cli`. For interacting with contract, we have two commands, `call` and `view`.

`call` command makes a contract call which can modify or view state which takes some amount of fee. On other hand, `view` command makes a contract call which can only view state and this call is free of charge. Learn more about `near-cli` [here](https://docs.near.org/docs/tools/near-cli).

Let's make our first call. As this is our first call we should get 0 as the output:

```bash
near view YOUR_ACCOUNT_ID getCounter '{}'
```
output:

```bash
View call: YOUR_ACCOUNT_ID.getCounter({})
0
```
Now, we'll increment the counter by one:

```bash
near call YOUR_ACCOUNT_ID incrementCounter '{"value": 1}' --accountId YOUR_ACCOUNT_ID
```
output:

```bash
Scheduling a call: boggiman.testnet.incrementCounter({"value": 1})
Receipt: JD3cbUzg6WcpRwGDiTvB2EXyKxHh13jyKidYyVxW6s5E
        Log [boggiman.testnet]: Counter is now: 1
Transaction Id C8eUHse2EbWiGjiKLzVzXsJQscPpdb36G63uH1uP72e9
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/C8eUHse2EbWiGjiKLzVzXsJQscPpdb36G63uH1uP72e9
''
```
Decrementing counter will be similar to incrementing the counter with `decrementCounter` as the function name and to reset the counter you can use the `view` command.

## Conclusion

In this tutorial, we have learned how to use singleton class pattern to create smart contract for NEAR protocol. What is singleton pattern and how it works. We have used testnet of NEAR protocol to deploy that contract and learned some new things.

This is second tutorial in a series of tutorials. Please stay tuned for the next one.

If you have any doubt about NEAR protocol or smart contract development, you can ask it in the [official discord server](https://discord.gg/wpa49JhC). If you're interested in learning more can go to [bootcamp](https://learnnear.club/?mref=0xnik.near%40learnnear.club) conducted by NEAR foundation.

Also, any feedback or improvement in this article is appreciated. If you have any go in this repo and create an issue.