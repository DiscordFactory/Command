import Command from "../Command";
import { prompt } from "enquirer";
import { spawn } from "child_process";
import fs from 'fs';
import path from "path";
import PresetPackage from '../ClonePresets/Package'
import PresetEnv from '../ClonePresets/Env'
import PresetYaml from '../ClonePresets/EnvYaml'
import PresetJson from '../ClonePresets/EnvJson'
import Colors from "../Colors";

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


export default class CreateProject extends Command {
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
          message: 'Who are you ?',
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
    const ls = spawn('git', ['clone', 'https://github.com/DiscordFactory/Factory.git', project.name])

    ls.on('close', async () => {
      await fs.promises.writeFile(
        path.join(process.cwd(), project.name, 'package.json'),
        PresetPackage
          .replace('$project_name', project.name)
          .replace('$project_version', project.version)
          .replace('$project_description', project.description)
          .replace('$project_author', project.author)
          .trim())

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

    process.stdout.write(`\n${Colors.TextGreen}✔️ Your project has been well initiated.${Colors.Reset}\n\n`)
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

    process.stdout.write(`\n${Colors.TextGreen}✔️ Your project has been well initiated.${Colors.Reset}\n\n`)
  }

  private async createJson (project: Project) {
    console.log(project)
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

    process.stdout.write(`\n${Colors.TextGreen}✔️ Your project has been well initiated.${Colors.Reset}\n\n`)
  }
}