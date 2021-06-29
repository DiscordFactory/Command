import path from "path";
import fs from "fs";

export async function prepareFile (type: string, targetLocation: string) {
  const location = path.parse(targetLocation)
  const targetFile = path.join(process.cwd(), 'src', location.dir, `${location.name}.ts`)

  const templateFile = await fs.promises.readFile(
    path.join(__dirname, '..', '..', 'templates', type),
    { encoding: 'utf-8' })

  const filenameUpper = location.name.charAt(0).toUpperCase() + location.name.slice(1)

  return {
    location,
    templateFile,
    targetFile,
    filenameUpper,
  }
}

