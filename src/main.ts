import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import fs from 'fs-extra'
import path from 'node:path'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const packageJson = getPackageJson() as { version: string }
    const version = packageJson.version.toString()
    core.debug(`Version from package.json: ${version}`)

    const token = core.getInput('token')

    if (!token) {
      throw new Error('input token is not set')
    }

    await getOctokit(token).rest.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: version,
      name: version,
      draft: false,
      prerelease: false,
      generate_release_notes: true
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function getPackageJson(): unknown {
  const pathToPackage = path.join(
    process.env.GTHUB_WORKSPACE ?? '',
    'package.json'
  )
  core.debug(`Path to package.json: ${pathToPackage}`)

  if (!fs.existsSync(pathToPackage)) {
    throw new Error(`Could not find the package.json file: ${pathToPackage}`)
  }

  return fs.readJSONSync(pathToPackage)
}
