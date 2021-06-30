import path from 'path'
import fs from 'fs'

export async function getPackage (projectName: string): Promise<any> {
  const location = path.join(process.cwd(), projectName, 'package.json')
  const jsonPackage = await fs.promises.readFile(location, 'utf-8')
  return JSON.parse(jsonPackage)
}

export async function getCoreVersion (projectName: string) {
  const JsonPackage = await getPackage(projectName)
  return JsonPackage.dependencies['@discord-factory/core']
}

export async function getDiscordVersion (projectName: string) {
  const JsonPackage = await getPackage(projectName)
  return JsonPackage.dependencies['discord.js']
}
