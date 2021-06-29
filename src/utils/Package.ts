import path from 'path'

async function getPackage (projectName: string) {
  const location = path.join(process.cwd(), projectName, 'package.json')
  return import(location)
}

export async function getCoreVersion (projectName: string) {
  const JsonPackage = await getPackage(projectName)
  return JsonPackage.default.dependencies['@discord-factory/core']
}

export async function getDiscordVersion (projectName: string) {
  const JsonPackage = await getPackage(projectName)
  return JsonPackage.default.dependencies['discord.js']
}
