import BaseMakeFile from "../BaseMakeFile";
import path from "path";
import fs from "fs";
import Colors from "../types/Colors";
import { prepareFile } from "../utils/Files";
import { FileOptions } from "../types/Makes";

export default class MakeMigrationCreateTable extends BaseMakeFile {
  constructor () {
    super('migrations')
  }

  public async run (dir: string, options: FileOptions): Promise<void> {
    const timestamp = Date.now().toString()
    const { templateFile, targetFile, filenameUpper, location } = await prepareFile(`${this.type}/CreateTable`, dir)
    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    const filename = filenameUpper.split('_')
    filename.shift()

    const fileData = templateFile
      .replace(/\$className/g, filename.join('_'))
      .replace(/\$table/g, options?.migration!)
      .replace(/\$timestamp/g, timestamp)

    await fs.promises.writeFile(targetFile, fileData)

    process.stdout.write(`\n${Colors.Reverse}${Colors.Bright}${Colors.TextGreen}File was created in ${targetFile.replace(/\\/g, '\\\\')}.${Colors.Reset}\n`)
  }
}