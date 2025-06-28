import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { DataImporter } from '@/lib/data-import'

const DATA_DIR = path.join(process.cwd(), 'background/data')
const dataImporter = new DataImporter()

const importTasks = [
  { file: 'SDWA_PUB_WATER_SYSTEMS.csv', fn: dataImporter.importWaterSystems.bind(dataImporter), label: 'Water Systems' },
  { file: 'SDWA_VIOLATIONS_ENFORCEMENT.csv', fn: dataImporter.importViolations.bind(dataImporter), label: 'Violations Enforcement' },
  { file: 'SDWA_FACILITIES.csv', fn: dataImporter.importFacilities.bind(dataImporter), label: 'Facilities' },
  { file: 'SDWA_REF_CODE_VALUES.csv', fn: dataImporter.importReferenceCodes.bind(dataImporter), label: 'Reference Codes' }
]

async function main() {
  for (const { file, fn, label } of importTasks) {
    const filePath = path.join(DATA_DIR, file)
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`)
      continue
    }
    console.log(`Importing ${label} from ${file}...`)
    const csvRaw = fs.readFileSync(filePath, 'utf8')
    const csvData = parse(csvRaw, { columns: true, skip_empty_lines: true })
    const result = await fn(csvData)
    if (!result.success) {
      console.error(`Error importing ${label}:`, result.errors)
      process.exit(1)
    }
    console.log(`Imported ${result.recordsInserted} records for ${label}.`)
  }
  console.log('All data imported successfully!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
}) 