import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Account } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { PersonalBankFactory } from '../artifacts/personal_bank/PersonalBankClient'
import * as boxUtils from './boxUtils'

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
    const { testAccount, algorand } = localnet.context
    const { client } = await deploy(testAccount)

    const payTxn = await algorand.createTransaction.payment({
      sender: testAccount.addr,
      receiver: client.appAddress,
      amount: AlgoAmount.Algos(1),
    })

    const result = await client.send.deposit({ args: { payTxn, gitHubUsername }, populateAppCallResources: true })

    expect(result.return).toBe(1000000n)

    //const boxNames = await client.appClient.getBoxNames()
    //console.log('boxNames', boxNames)

    let boxValue = Uint8Array.from([])

    const boxId1 = boxUtils.getBoxId('depositors', testAccount.publicKey)
    //console.log('boxId1', boxId1);
    boxValue = await client.appClient.getBoxValue(boxId1)
    //console.log('boxValue', boxValue)
    //console.log('boxValue as uint64', boxUtils.Uint8ArrayToBigInt(boxValue))
    expect(boxUtils.Uint8ArrayToBigInt(boxValue)).toBe(1000000n)

    const boxId2 = boxUtils.getBoxId('appCreatorGitHubUsername', new TextEncoder().encode('github'))
    //console.log('boxId2', boxId2)
    boxValue = await client.appClient.getBoxValue(boxId2)
    //console.log('boxValue', boxValue)
    //console.log('boxValue as string', boxUtils.Uint8ArrayToString(boxValue))
    expect(boxUtils.Uint8ArrayToString(boxValue)).toBe(gitHubUsername)
  })

  test('deposit & withdraw', async () => {
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

    const result = await client.send.withdraw({
      args: {},
      coverAppCallInnerTransactionFees: true,
      maxFee: AlgoAmount.MicroAlgo(3000),
    })

    expect(result.return).toBe(1000000n)
  })
})
