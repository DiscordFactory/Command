import BaseCommand from "../BaseCommand"
import { prompt } from "enquirer"
import { spawn } from "child_process"
import fs from 'fs'
import path from "path"
import PresetPackage from '../ClonePresets/Package'
import PresetEnv from '../ClonePresets/Env'
import PresetYaml from '../ClonePresets/EnvYaml'
import PresetJson from '../ClonePresets/EnvJson'
import Colors from "../types/Colors"
import Command from "../decorators/Command"
import { getCoreVersion, getDiscordVersion, getPackage } from "../utils/Package"

type Project = {
  name: string
  version: string,
  description: string,
  author: string,
  prefix: string,
  token: string,
  environmentType: string
  partials: Array<string>
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
        JSON.stringify(json,null,2)
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
        .trim())

    await this.sendInfo(project)
  }

  private async createYaml (project: Project) {
    await fs.promises.writeFile(
      path.join(process.cwd(), project.name, 'environment.yaml'),
      PresetYaml
        .replace('$APP_TOKEN', project.token)
        .replace('$APP_PREFIX', project.prefix)
        .replace('$COMMAND_AUTO_REMOVE', (project.autoRemove === 'Yes').toString())
        .replace('$PARTIALS', project.partials.reduce((acc, current) => {
          if (acc) {
            return `- ${acc}\n` + `  - ${current}`
          }
          return `\n  - "${current}"`
        })).replace('- -', '-')
        .trim())

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
        PARTIALS: project.partials
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
    process.stdout.write(Colors.Bright + Colors.TextCyan + 'npm run test : ' + Colors.Reset + Colors.TextCyan + 'Run the application tests.' + Colors.Reset + '\n')
  }
}