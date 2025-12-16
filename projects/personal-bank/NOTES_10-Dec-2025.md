# algorand-typescript-workshop

10-Dec-2025 18:00PM (CET)

Jorrin Bruns, Gabriel Kuettel

This repository is forked from `https://github.com/algorand-devrel/algorand-typescript-workshop`

Open the workspace, go to `projects/personal-bank`

To install dependencies, use `algokit -v project bootstrap all` or `npm install`

To build the smart contract, use `algokit -v project run build` or `npm run build`

To test the smart contract, use `algokit -v project run test` or `npm run test`

## Modifications made to `personal-bank/contract.algo.ts`

- added a new box, with a `github` prefix and a key of space.

- modified the `deposit` method, to store `gitHubUsername` param value in the box with `github` prefix and a key of space. With empty key the Puya compiler gave `Critical error`.

## Modifications made to `contract.spec.ts`

- added the new param to the call of `deposit` method

## Modifications made to  `contract.integration.spec.ts`

- added the new param to the call of `deposit` method

- read back and checked the values of the boxes

## New file

- `boxUtils.ts`, to make box handling more easy

## Notes

- fixed: when you call the `deposit` method using LORA App Lab, it is now unnecessary to press "Populate Resources" before "Send"

- before you call the `withdraw` method using LORA App Lab, send the Minimum Balance required for the boxes to the app address, otherwise the method call fails with "balance 0 below min 131000". Send 0.131 Algo, which is the minimum balance requirement for the app address.

- when you call the `withdraw` method using LORA App Lab, unclick "Set fees automatically", and set the fee to 0.002 Algo, otherwise the method call fails with "Fee too low"

- fixed: when you use LORA App Lab to examine the `depositors` box value, using "App Lab | State | Box | depositors | View", LORA now displays the box value as an uint64. Formerly it gave an error: "Error: byte string must correspond to an uint64".

- fixed: when you use LORA App Lab to examine the `github` box value, using "App Lab | State | Box | github | View", LORA displays the box value correctly. Formerly it displayed an incorrect value.

- when `send` was pressed in LORA App Lab, I got an error: `Confirmation Failed(4100) Transaction request pending: the user currently has another transaction request in progress.` First you had to press `Simulate`, then `Send` to solve this issue.

- when 0.131 Algo was sent to the app address, I got an error: `Confirmation Failed(4100) Transaction request pending: the user currently has another transaction request in progress.`  First you had to press `Simulate`, then `Send` to solve this issue.

## Summary
This `personal_bank` example is like the proverbial vet school horse: the minimum balance requirement mandated by the boxes was not transferred to the app's address when the app was created. Because of this, it was merely by chance that the first `deposit` call succeeded, because the transferred amount was greater than the minimum balance requirement. However, the `withdraw` call failed, and it displayed how much is the minimum required amount for the app's account. After transferring this amount, the `withdraw` app call worked correctly.

It’s just the icing on the cake that for the `Send` operation to execute without errors, the `Simulate` button also had to be pressed in LORA each time. Unfortunately, the example has not been updated since the workshop on April 28th; only some of LORA's errors have been fixed.
