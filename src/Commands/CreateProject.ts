import BaseCommand from "../BaseCommand"
import { prompt } from "enquirer"
import { spawn } from "child_process"
import fs from 'fs'
import path from "path"
import PresetEnv from '../ClonePresets/Env'
import PresetJson from '../ClonePresets/EnvJson'
import Colors from "../types/Colors"
import Command from "../decorators/Command"
import { getCoreVersion, getDiscordVersion, getPackage } from "../utils/Package"
import YAML from 'js-yaml'

type Project = {
  name: string
  version: string,
  description: string,
  author: string,
  prefix: string,
  token: string,
  environmentType: string
  partials: string[]
  intents: string[]
  autoRemove: string
}

@Command({
  label: 'Create project',
  usages: ['factory create-project'],
  description: 'This command generates a blank project based on a multiple choice questionnaire.'
})
export default class CreateProject extends BaseCommand {
  constructor () {
    super('create-project');
  }

  public async run (): Promise<void> {
    process.stdout.write(`${Colors.TextCyan}\n`
      + '\n'
      + '███████╗   █████╗    ██████╗ ████████╗   ██████╗    ██████╗   ██╗   ██╗\n'
      + '██╔════╝  ██╔══██╗  ██╔════╝ ╚══██╔══╝  ██╔═══██╗   ██╔══██╗  ╚██╗ ██╔╝\n'
      + '█████╗    ███████║  ██║         ██║     ██║   ██║   ██████╔╝   ╚████╔╝ \n'
      + '██╔══╝    ██╔══██║  ██║         ██║     ██║   ██║   ██╔══██╗    ╚██╔╝  \n'
      + '██║       ██║  ██║  ╚██████╗    ██║     ╚██████╔╝   ██║  ██║     ██║   \n'
      + '╚═╝       ╚═╝  ╚═╝   ╚═════╝    ╚═╝      ╚═════╝    ╚═╝  ╚═╝     ╚═╝   \n'
      + `${Colors.Reset}\n`)

    try {
      const project: Project = await prompt([
        {
          name: 'name',
          type: 'input',
          message: 'What is the name of your project ?',
          validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
            return !!value.length
          }
        },
        {
          name: 'version',
          type: 'text',
          message: 'What is the version of your project ?',
          validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
            return !/^(?:\d+\.){2}\d+$/gm.test(value)
              ? 'Please format like 1.0.0'
              : true
          }
        },
        {
          name: 'description',
          type: 'text',
          message: 'What is the description of your project ?',
        },
        {
          name: 'author',
          type: 'text',
          message: 'What is the name of the developer ?',
        },
        {
          name: 'environmentType',
          message: 'Which environment file do you want to use ?',
          type: 'select',
          choices: [
            { name: 'env', value: 'ENV' },
            { name: 'json', value: 'JSON' },
            { name: 'yaml', value: 'YAML' },
          ]
        },
        {
          name: 'prefix',
          type: 'text',
          message: 'Your discord bot prefix',
          validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
            return !!value.length
          }
        },
        {
          name: 'token',
          type: 'text',
          message: 'Discord bot token',
          validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
            return !!value.length
          }
        },
        {
          name: 'partials',
          message: 'Select the Partials you will need',
          type: 'multiselect',
          choices: [
            { name: 'MESSAGE', value: 'MESSAGE' },
            { name: 'CHANNEL', value: 'CHANNEL' },
            { name: 'REACTION', value: 'REACTION' }
          ]
        },
        {
          name: 'intents',
          message: 'Select all intents you will need',
          type: 'multiselect',
          choices: [
            { name: 'GUILDS', value: 'GUILDS' },
            { name: 'GUILD_MEMBERS', value: 'GUILD_MEMBERS' },
            { name: 'GUILD_BANS', value: 'GUILD_BANS' },
            { name: 'GUILD_EMOJIS_AND_STICKERS', value: 'GUILD_EMOJIS_AND_STICKERS' },
            { name: 'GUILD_INTEGRATIONS', value: 'GUILD_INTEGRATIONS' },
            { name: 'GUILD_WEBHOOKS', value: 'GUILD_WEBHOOKS' },
            { name: 'GUILD_INVITES', value: 'GUILD_INVITES' },
            { name: 'GUILD_VOICE_STATES', value: 'GUILD_VOICE_STATES' },
            { name: 'GUILD_PRESENCES', value: 'GUILD_PRESENCES' },
            { name: 'GUILD_MESSAGES', value: 'GUILD_MESSAGES' },
            { name: 'GUILD_MESSAGE_REACTIONS', value: 'GUILD_MESSAGE_REACTIONS' },
            { name: 'GUILD_MESSAGE_TYPING', value: 'GUILD_MESSAGE_TYPING' },
            { name: 'DIRECT_MESSAGES', value: 'DIRECT_MESSAGES' },
            { name: 'DIRECT_MESSAGE_REACTIONS', value: 'DIRECT_MESSAGE_REACTIONS' },
            { name: 'DIRECT_MESSAGE_TYPING', value: 'DIRECT_MESSAGE_TYPING' },
          ]
        },
        {
          name: 'autoRemove',
          message: 'Do you want the order messages to be deleted automatically ?',
          type: 'select',
          choices: [
            { name: 'Yes', value: 'true' },
            { name: 'No', value: 'false' },
          ]
        }
      ])

      await this.cloneProject(project)
    } catch {
    }
  }

  private async cloneProject (project: Project) {
    const ls = spawn('git', ['clone', '--progress', 'https://github.com/DiscordFactory/Factory.git', project.name])

    ls.on('close', async () => {
      const json = {
        ...await getPackage(project.name),
        name: project.name,
        version: project.version,
        description: project.description,
        author: project.author
      }

      await fs.promises.writeFile(
        path.join(process.cwd(), project.name, 'package.json'),
        JSON.stringify(json, null, 2)
      )

      const environments: any = {
        env: () => this.createEnv(project),
        json: () => this.createJson(project),
        yaml: () => this.createYaml(project),
      }

      environments[project.environmentType]()
    })
  }

  private async createEnv (project: Project) {
    await fs.promises.writeFile(
      path.join(process.cwd(), project.name, '.env'),
      PresetEnv
        .replace('$APP_TOKEN', project.token)
        .replace('$APP_PREFIX', project.prefix)
        .replace('$PRESET_COMMAND_AUTO_REMOVE', (project.autoRemove === 'Yes').toString())
        .replace('$PARTIAL_MESSAGE', project.partials.some(p => p === 'MESSAGE').toString())
        .replace('$PARTIAL_CHANNEL', project.partials.some(p => p === 'CHANNEL').toString())
        .replace('$PARTIAL_REACTION', project.partials.some(p => p === 'REACTION').toString())

        .replace('$INTENT_GUILDS', project.intents.some(p => p === 'GUILDS').toString())
        .replace('$INTENT_GUILD_MEMBERS', project.intents.some(p => p === 'GUILD_MEMBERS').toString())
        .replace('$INTENT_GUILD_BANS', project.intents.some(p => p === 'GUILD_BANS').toString())
        .replace('$INTENT_GUILD_EMOJIS_AND_STICKERS', project.intents.some(p => p === 'GUILD_EMOJIS_AND_STICKERS').toString())
        .replace('$INTENT_GUILD_INTEGRATIONS', project.intents.some(p => p === 'GUILD_INTEGRATIONS').toString())
        .replace('$INTENT_GUILD_WEBHOOKS', project.intents.some(p => p === 'GUILD_WEBHOOKS').toString())
        .replace('$INTENT_GUILD_INVITES', project.intents.some(p => p === 'GUILD_INVITES').toString())
        .replace('$INTENT_GUILD_VOICE_STATES', project.intents.some(p => p === 'GUILD_VOICE_STATES').toString())
        .replace('$INTENT_GUILD_PRESENCES', project.intents.some(p => p === 'GUILD_PRESENCES').toString())
        .replace('$INTENT_GUILD_MESSAGES', project.intents.some(p => p === 'GUILD_MESSAGES').toString())
        .replace('$INTENT_GUILD_MESSAGE_REACTIONS', project.intents.some(p => p === 'GUILD_MESSAGE_REACTIONS').toString())
        .replace('$INTENT_GUILD_MESSAGE_TYPING', project.intents.some(p => p === 'GUILD_MESSAGE_TYPING').toString())
        .replace('$INTENT_DIRECT_MESSAGES', project.intents.some(p => p === 'DIRECT_MESSAGES').toString())
        .replace('$INTENT_DIRECT_MESSAGE_REACTIONS', project.intents.some(p => p === 'DIRECT_MESSAGE_REACTIONS').toString())
        .replace('$INTENT_DIRECT_MESSAGE_TYPING', project.intents.some(p => p === 'DIRECT_MESSAGE_TYPING').toString())
        .trim())

    await this.sendInfo(project)
  }

  private async createYaml (project: Project) {
    const yaml = {
      APP_TOKEN: project.token,
      APP_PREFIX: project.prefix,
      PARTIALS: project.partials,
      INTENTS: project.intents,
      PRESETS: {
        COMMAND_AUTO_REMOVE: project.autoRemove === 'Yes'
      },
      MESSAGES: {
        COMMAND_MISSING_PERMISSION: 'You\'re not authorized to execute this command',
        COMMAND_MISSING_ROLES: 'You\'re not authorized to execute this command',
        ENVIRONMENT_FILE_PREFIX_MISSING: 'The prefix is missing in the environment file.',
        ENVIRONMENT_FILE_TOKEN_MISSING: 'The token is missing in the environment file.',
        ENVIRONMENT_FILE_MISSING: 'Environment file is missing, please create one.',
      }
    }

    await fs.promises.writeFile(
      path.join(process.cwd(), project.name, 'environment.yaml'),
      YAML.dump(yaml)
    )

    await this.sendInfo(project)
  }

  private async createJson (project: Project) {
    await fs.promises.writeFile(
      path.join(process.cwd(), project.name, 'environment.json'), JSON.stringify({
        ...PresetJson,
        APP_TOKEN: project.token,
        APP_PREFIX: project.prefix,
        PRESETS: {
          COMMAND_AUTO_REMOVE: project.autoRemove === 'Yes'
        },
        PARTIALS: project.partials,
        INTENTS: project.intents
      }, null, " "))

    await this.sendInfo(project)
  }

  private async sendInfo (project: Project) {
    process.stdout.write('\n' + Colors.Reverse + Colors.Bright + Colors.TextCyan + '✔️ Your project has been well initiated.' + Colors.Reset + '\n\n')
    process.stdout.write(Colors.TextCyan + 'Version du core : ' + await getCoreVersion(project.name) + Colors.Reset + '\n')
    process.stdout.write(Colors.TextCyan + 'Version de discord.js : ' + await getDiscordVersion(project.name) + Colors.Reset + '\n\n')

    process.stdout.write(Colors.Bright + Colors.TextCyan + 'npm run dev : ' + Colors.Reset + Colors.TextCyan + 'Starts the application in the development environment.' + Colors.Reset + '\n')
    process.stdout.write(Colors.Bright + Colors.TextCyan + 'npm run build : ' + Colors.Reset + Colors.TextCyan + 'Builds and optimises the application for production.' + Colors.Reset + '\n')
    process.stdout.write(Colors.Bright + Colors.TextCyan + 'npm run start : ' + Colors.Reset + Colors.TextCyan + 'Starts the application in production mode.' + Colors.Reset + '\n')
    process.stdout.write(Colors.Bright + Colors.TextCyan + 'npm run test : ' + Colors.Reset + Colors.TextCyan + 'Run the application tests.' + Colors.Reset + '\n\n')
  }
}