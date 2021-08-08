import BaseCommand from "../BaseCommand";
import { prompt } from 'enquirer'
import path from "path";
import { ClientEvents } from 'discord.js'
import Events from '../Settings/Events'
import Hooks from '../Settings/Hooks'
import Colors from "../types/Colors";
import Command from "../decorators/Command";
import MakeCommand from "../makes/MakeCommand";
import MakeEvent from "../makes/MakeEvent";
import MakeHook from "../makes/MakeHook";
import MakeMiddleware from "../makes/MakeMiddleware";
import MakeModel from "../makes/MakeModel";
import MakeMigrationCreateTable from "../makes/MakeMigrationCreateTable";
import MakeMigrationAlterTable from "../makes/MakeMigrationAlterTable";
import MakeSlashCommand from "../makes/MakeSlashCommand";

@Command({
  label: 'Make file',
  description: 'Generates a commands, events, hooks, middlewares, models or migrations according to a question/answer set.',
  usages: [
    'factory make:file'
  ]
})
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
    const actions: any = {
      Event: async () => this.initializeEvent(),
      Command: async () => this.initializeCommand(),
      SlashCommand: async () => this.initializeSlashCommand(),
      Middleware: async () => this.initializeMiddleware(),
      Hook: async () => this.initializeHook(),
      Model: async () => this.initializeModel(),
      Migration: async () => this.initializeMigration(),
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
          'Command',
          'SlashCommand',
          'Event',
          'Middleware',
          'Hook',
          'Model',
          'Migration'
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

  private async choiceMigration (): Promise<{ migration: string } | undefined> {
    try {
      return await prompt({
        name: 'migration',
        message: 'For which model do you want to generate a migration ?',
        type: 'input'
      })
    } catch {
    }
  }

  private async choiceMigrationType (): Promise<{ migrationType: string }> {
    return await prompt([
      {
        name: 'migrationType',
        message: 'Would you like to create or modify a table in your database ?',
        type: 'select',
        choices: [
          'Create table',
          'Alter table',
        ]
      }
    ])
  }

  private async initializeEvent (): Promise<void> {
    const event = (await this.choiceEvent())!.event
    const filename = (await this.choiceFilename())!.filename

    if (event && filename) {
      await new MakeEvent().run(filename, { event })
    }
  }

  private async initializeCommand (): Promise<void> {
    const filename = (await this.choiceFilename())!.filename
    if (filename) {
      await new MakeCommand().run(filename)
    }
  }

  private async initializeSlashCommand (): Promise<void> {
    const filename = (await this.choiceFilename())!.filename
    if (filename) {
      await new MakeSlashCommand().run(filename)
    }
  }

  private async initializeMiddleware (): Promise<void> {
    const middleware = (await this.choiceMiddleware())!.middleware
    const filename = (await this.choiceFilename())!.filename

    if (middleware && filename) {
      await new MakeMiddleware().run(filename, { middleware })
    }
  }

  private async initializeHook (): Promise<void> {
    const hook = (await this.choiceHook())!.hook
    const filename = (await this.choiceFilename())!.filename

    if (hook && filename) {
      await new MakeHook().run(filename, { hook })
    }
  }

  private async initializeModel (): Promise<void> {
    const filename = (await this.choiceFilename())!.filename

    if (filename) {
      await new MakeModel().run(filename)
    }
  }

  private async initializeMigration (): Promise<void> {
    const JsonPackage = await import(path.join(process.cwd(), 'package.json'))
    if (!JsonPackage.dependencies['@discord-factory/storage']) {
      process.stdout.write('\n' + Colors.TextCyan + 'The Storage package cannot be found, please install it using : ' + Colors.Reset)
      process.stdout.write('\n' + Colors.Bright + Colors.TextCyan + ' • npm install @discord-factory/storage' + Colors.Reset + '\n\n')
      return
    }

    const filename = (await this.choiceFilename())!.filename
    const migration = (await this.choiceMigration())!.migration.toLowerCase()
    const migrationType = (await this.choiceMigrationType()).migrationType
    const timestamp = Date.now()

    if (!filename) {
      return
    }

    const p = filename.toLowerCase().split('/')
    p[p.length] = `${timestamp}_${p.pop()}`

    if (migrationType === 'Create table') {
      await new MakeMigrationCreateTable().run(p.join('/'), { migration, timestamp })
    }

    if (migrationType === 'Alter table') {
      await new MakeMigrationAlterTable().run(p.join('/'), { migration, timestamp })
    }
  }
}