import Command from "../Command";
import { prompt } from "enquirer";
import { spawn } from "child_process";
import fs from 'fs';
import path from "path";
import PresetPackage from '../ClonePresets/Package'
import PresetEnv from '../ClonePresets/Env'
import Colors from "../Colors";

type Project = {
  name: string
  version: string,
  description: string,
  author: string,
  prefix: string,
  token: string,
  partials: Array<string>
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
        // {
        //   name: 'partials',
        //   message: 'Select the Partials you will need',
        //   type: 'multiselect',
        //   choices: [
        //     { name: 'MESSAGE', value: 'MESSAGE' },
        //     { name: 'CHANNEL', value: 'CHANNEL' },
        //     { name: 'REACTION', value: 'REACTION' }
        //   ]
        // }
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

      await fs.promises.writeFile(
        path.join(process.cwd(), project.name, '.env'),
        PresetEnv
          .replace('$client_prefix', project.prefix)
          .replace('$client_token', project.token)
          .replace('$client_partials', JSON.stringify(project.partials))
          .trim())

      process.stdout.write(`\n${Colors.TextGreen}Your project has been well initiated.${Colors.Reset}\n\n`)
    })
  }
}