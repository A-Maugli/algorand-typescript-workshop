import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { ABIUintType, Account } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { PersonalBankFactory } from '../artifacts/personal_bank/PersonalBankClient'
import * as boxUtils from './boxUtils'

const VERBOSE_LOGS = true;

describe('personal bank contract', () => {
  const gitHubUsername = 'a-maugli'
  const localnet = algorandFixture()
  beforeAll(() => {
    Config.configure({
      debug: true,
    })
    registerDebugEventHandlers()
  })
  beforeEach(localnet.newScope)

  const deploy = async (account: Account & TransactionSignerAccount) => {
    const factory = localnet.algorand.client.getTypedAppFactory(PersonalBankFactory, {
      defaultSender: account.addr,
      defaultSigner: account.signer,
    })

    const { appClient } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append', suppressLog: true })
    return { client: appClient }
  }

  test('deposit', async () => {
    // Arrange
    const { testAccount, algorand } = localnet.context
    const { client } = await deploy(testAccount)

    const payTxn = await algorand.createTransaction.payment({
      sender: testAccount.addr,
      receiver: client.appAddress,
      amount: AlgoAmount.Algos(1),
    })

    // Act
    const result = await client.send.deposit({ args: { payTxn, gitHubUsername }, populateAppCallResources: true })
    
    // Assert
    expect(result.return).toBe(1000000n)

    if (VERBOSE_LOGS) {
      const boxNames = await client.appClient.getBoxNames()
      console.log('boxNames', boxNames)
    }

    const box1Id = boxUtils.getBoxId('depositors', testAccount.publicKey)
    if (VERBOSE_LOGS) {
      console.log('box1Id', box1Id)
    } 
    const box1Value = await client.appClient.getBoxValueFromABIType(box1Id, new ABIUintType(64));
    expect(box1Value).toBe(1000000n)
    if (VERBOSE_LOGS) {
      console.log('box1Value', box1Value)
    }

    // Alternative way to verify the value of box1
    const box1Value2 = await client.appClient.getBoxValue(box1Id)
    if (VERBOSE_LOGS) {
      console.log('box1Value2', box1Value2)
      console.log('box1Value2 as uint64', boxUtils.Uint8ArrayToBigInt(box1Value2))
    }
    expect(boxUtils.Uint8ArrayToBigInt(box1Value2)).toBe(1000000n)

    const box2Id = boxUtils.getBoxId('github', new TextEncoder().encode(' '))
    if (VERBOSE_LOGS) {
      console.log('box2Id', box2Id)
    }
    const box2Value = await client.appClient.getBoxValue(box2Id)
    if (VERBOSE_LOGS) {
      console.log('box2Value', box2Value)
      console.log('box2Value as string', boxUtils.Uint8ArrayToString(box2Value))
      // problem is caused by "raw" write to box without ABI encoding
    }
    expect(boxUtils.Uint8ArrayToString(box2Value)).toBe(gitHubUsername)
  })

  test('deposit & withdraw', async () => {
    // Arrange
    const { testAccount, algorand } = localnet.context
    const { client } = await deploy(testAccount)

    const dispenser = await algorand.account.localNetDispenser()

    await algorand.account.ensureFunded(client.appAddress, dispenser, AlgoAmount.Algos(1))

    const payTxn = await algorand.createTransaction.payment({
      sender: testAccount.addr,
      receiver: client.appAddress,
      amount: AlgoAmount.Algos(1),
    })

    await client.send.deposit({ args: { payTxn, gitHubUsername }, populateAppCallResources: true })

    // Act
    const result = await client.send.withdraw({
      args: {},
      coverAppCallInnerTransactionFees: true,
      maxFee: AlgoAmount.MicroAlgo(3000),
    })

    // Assert
    expect(result.return).toBe(1000000n)
  })
})
