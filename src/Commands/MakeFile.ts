import BaseCommand from "../BaseCommand";
import { prompt } from "enquirer";
import fs from "fs";
import path from "path";
import { ClientEvents } from 'discord.js'
import Events from '../Settings/Events'
import Hooks from '../Settings/Hooks'
import Colors from "../types/Colors";

type Actions = {
  Event: () => Promise<void>,
  Command: () => Promise<void>,
  Middleware: () => Promise<void>
  Hook: () => Promise<void>
}

export default class MakeFile<K extends keyof ClientEvents> extends BaseCommand {
  constructor () {
    super('make:file');
  }

  public async run (): Promise<void> {
    try {
      const type = (await this.choiceType()).type
      await this.dispatchType(type)
    } catch {
    }
  }

  private async dispatchType (eventType: string) {
    const actions: Actions = {
      Event: async () => this.initializeEvent(),
      Command: async () => this.initializeCommand(),
      Middleware: async () => this.initializeMiddleware(),
      Hook: async () => this.initializeHook()
    }

    // @ts-ignore
    actions[eventType]()
  }

  private async choiceType (): Promise<{ type: string }> {
    return await prompt([
      {
        name: 'type',
        message: 'What type of file do you want ?',
        type: 'select',
        choices: [
          'BaseCommand',
          'Event',
          'Middleware',
          'Hook'
        ]
      }
    ])
  }

  private async choiceFilename (): Promise<{ filename: string } | undefined> {
    try {
      return await prompt({
        name: 'filename',
        message: 'What do you want to name it ?',
        type: 'input',
        validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
          return !/^\w+(\/\w+)*$/gm.test(value)
            ? 'Please format like MyFile or Folder/MyFile'
            : true
        }
      })
    } catch {
    }
  }

  private async choiceEvent (): Promise<{ event: K } | undefined> {
    try {
      return await prompt({
        name: 'event',
        message: 'Which discord.js event do you want to use ?',
        type: 'autocomplete',
        choices: Events,
      })
    } catch {
    }
  }

  private async choiceHook (): Promise<{ hook: string } | undefined> {
    try {
      return await prompt({
        name: 'hook',
        message: 'Which hook do you want to use ?',
        type: 'autocomplete',
        choices: Hooks,
      })
    } catch {
    }
  }

  private async choiceMiddleware (): Promise<{ middleware: string } | undefined> {
    try {
      return await prompt({
        name: 'middleware',
        message: 'Define the validation rule for this middleware',
        type: 'input'
      })
    } catch {
    }
  }

  private async initializeEvent (): Promise<void> {
    const event = (await this.choiceEvent())!.event
    const filename = (await this.choiceFilename())!.filename

    if (event && filename) {
      await this.makeFile('Event', filename, { event })
    }
  }

  private async initializeCommand (): Promise<void> {
    const filename = (await this.choiceFilename())!.filename

    if (filename) {
      await this.makeFile('BaseCommand', filename)
    }

  }

  private async initializeMiddleware (): Promise<void> {
    const middleware = (await this.choiceMiddleware())!.middleware
    const filename = (await this.choiceFilename())!.filename

    if (middleware && filename) {
      await this.makeFile('Middleware', filename, { middleware })
    }
  }

  private async initializeHook (): Promise<void> {

    const hook = (await this.choiceHook())!.hook
    const filename = (await this.choiceFilename())!.filename

    if (hook && filename) {
      await this.makeFile('Hook', filename, { hook })
    }
  }

  private async makeFile (type: string, targetLocation: string, fileOptions?: { event?: K, middleware?: string, hook?: string }): Promise<void> {
    const location = path.parse(targetLocation)
    const templateDir = path.join(__dirname, '..', '..', 'templates', type)
    const templateFile = await fs.promises.readFile(templateDir, { encoding: 'utf-8' })
    const targetFile = path.join(process.cwd(), 'src', location.dir, `${location.name}.ts`)
    const filenameUpper = location.name.charAt(0).toUpperCase() + location.name.slice(1)

    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    const fileData = templateFile
      .replace(/\$className/g, filenameUpper)
      .replace('$tag', location.name.toLowerCase())
      .replace('$event', fileOptions?.event!)
      .replace('$middleware', fileOptions?.middleware!)
      .replace('$hook', fileOptions?.hook!)

    await fs.promises.writeFile(targetFile, fileData)

    process.stdout.write(`${Colors.TextGreen}File was created : ${targetFile.replace(/\\/g, '\\\\')}.${Colors.Reset}\n`)
  }
}