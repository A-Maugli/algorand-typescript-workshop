# algorand-typescript-workshop

28-Apr-2025

Astha Yadav, Marco Podien

This repository is the clone of `https://github.com/algorand-devrel/algorand-typescript-workshop`

Open the workspace, go to `personal-bank`

To build the smart contract, use `algokit -v project run build` or `npm run build`

To test the smart contract, use `algokit -v project run test` or `npm run test`

## Modifications made to `personal-bank/contract.algo.ts`

- added a new box, named `appCreatorGitHubUsername`

- modified `deposit` method, to store `gitHubUsername` param value in the `appCreatorGitHubUsername` box with key `github`

## Modifications made to `contract.spec.ts`

- added the new param to the call of `deposit` method

## Modification made to  `contract.integration.spec.ts`

- added the new param to the call of `deposit` method

- read back and checked the values of the boxes

## New file

- `boxUtils.ts`, to make box handling more easy

## Notes

- when you use LORA App Lab to call the `deposit` method, press "Populate Resources" before "Send"

- before you use LORA App Lab to call the `withdraw` method, send the Minimum Balance required for the boxes to the SC address, otherwise the method call fails with "Balance too low". E.g., send 1 Algo to the SC address.

- when you use LORA App Lab to call the `withdraw` method, unclick "Set fees automatically", and set the fee to 0.002 Algo, otherwise you the method call fails with "Fee too low"

- when you use LORA App Lab to examine the `depositors` box value, using "App Lab | State | Box | depositors View",
LORA gives an error message: "Error: byte string must correspond to an uint64". This is a LORA error. Instead, the box value as an uint64 should be displayed.

- when you use LORA App Lab to examine the `appCreatorGitHubUsername` box value, using "App Lab | State | Box | appCreatorGitHubUsername View", LORA displays an icorrect value. This is a LORA error.
