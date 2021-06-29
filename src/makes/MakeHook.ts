import BaseMakeFile from "../BaseMakeFile";
import path from "path";
import fs from "fs";
import Colors from "../types/Colors";
import { prepareFile } from "../utils/Files";
import { FileOptions } from "../types/Makes";

export default class MakeHook extends BaseMakeFile {
  constructor () {
    super('hook')
  }

  public async run (dir: string, options: FileOptions): Promise<void> {
    const { templateFile, targetFile, filenameUpper, location } = await prepareFile(this.type, dir)
    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    const fileData = templateFile
      .replace(/\$className/g, filenameUpper)
      .replace('$hook', options?.hook!)

    await fs.promises.writeFile(targetFile, fileData)

    process.stdout.write(`\n${Colors.Reverse}${Colors.Bright}${Colors.TextGreen}File was created in ${targetFile.replace(/\\/g, '\\\\')}.${Colors.Reset}\n`)
  }
}