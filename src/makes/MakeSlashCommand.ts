import BaseMakeFile from "../BaseMakeFile";
import path from "path";
import fs from "fs";
import Colors from "../types/Colors";
import { prepareFile } from "../utils/Files";

export default class MakeSlashCommand extends BaseMakeFile {
  constructor () {
    super('SlashCommand')
  }

  public async run (dir: string): Promise<void> {
    const { templateFile, targetFile, filenameUpper, location } = await prepareFile(this.type, dir)
    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    const fileData = templateFile
      .replace(/\$className/g, filenameUpper)
      .replace('$tag', location.name.toLowerCase())

    await fs.promises.writeFile(targetFile, fileData)

    process.stdout.write(`\n${Colors.Reverse}${Colors.Bright}${Colors.TextGreen}File was created in ${targetFile.replace(/\\/g, '\\\\')}.${Colors.Reset}\n`)
  }
}