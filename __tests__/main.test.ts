/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import fs from 'fs-extra'

const createReleaseMock = jest.fn()
jest.mock('@actions/github', () => ({
  ...jest.requireActual('@actions/github'),
  getOctokit: jest.fn(() => ({
    rest: {
      repos: {
        createRelease: createReleaseMock
      }
    }
  })),
  context: {
    repo: {
      owner: 'owner',
      repo: 'repo'
    }
  }
}))
jest.mock('@actions/core', () => ({
  ...jest.requireActual('@actions/core'),
  debug: jest.fn(),
  error: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const token = 'token mock'

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a release', async () => {
    // Set the action's inputs as return values from core.getInput()
    ;(core.getInput as jest.Mock).mockImplementation(() => {
      return token
    })

    await main.run()
    expect(runMock).toHaveReturned()

    const packagejson = await fs.readJSON('package.json')

    // Verify that all of the core library functions were called correctly
    expect(core.debug).toHaveBeenNthCalledWith(
      1,
      'Path to package.json: package.json'
    )
    expect(core.debug).toHaveBeenNthCalledWith(
      2,
      `Version from package.json: ${packagejson.version}`
    )

    // Verify if createRelease was called correctly
    expect(createReleaseMock).toHaveBeenNthCalledWith(1, {
      draft: false,
      generate_release_notes: true,
      name: packagejson.version,
      owner: 'owner',
      prerelease: false,
      repo: 'repo',
      tag_name: packagejson.version
    })
  })

  it('should fail if token is not passed', async () => {
    // Set the action's inputs as return values from core.getInput()
    ;(core.getInput as jest.Mock).mockImplementation(() => {
      return ''
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'input token is not set')
    expect(core.error).not.toHaveBeenCalled()
  })

  it('should fail if package.json is not found', async () => {
    process.env.GTHUB_WORKSPACE = 'inexistent/dir'
    ;(core.getInput as jest.Mock).mockImplementation(() => {
      return token
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Could not find the package.json file: inexistent/dir/package.json'
    )
  })
})
