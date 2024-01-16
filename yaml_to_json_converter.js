const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function convertYamlToJson(yamlFilePath) {
  const yamlData = fs.readFileSync(yamlFilePath, 'utf8');
  const data = yaml.load(yamlData);

  const fileName = path.basename(yamlFilePath, path.extname(yamlFilePath)).toLowerCase();

  const convertKeysToLowerCase = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => convertKeysToLowerCase(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowercasedKey = key.toLowerCase();
        result[lowercasedKey] = convertKeysToLowerCase(value);
      }
      return result;
    } else {
      return obj;
    }
  };

  const convertedData = convertKeysToLowerCase(data);

  for (const entry of convertedData) {
    entry.tags = ['target', fileName];
    if (entry.Alternatives) {
      for (const alternative of entry.Alternatives) {
        alternative.tags = ['supported', fileName];
      }
    }
  }

  return convertedData;
}

function combineJsonFiles(directory) {
  const combinedData = {};

  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    for (const filename of files.sort()) {
      const yamlFilePath = path.join(directory, filename);
      const key = path.basename(filename, path.extname(filename)).toLowerCase();
      combinedData[key] = JSON.parse(JSON.stringify(convertYamlToJson(yamlFilePath)));
    }
  } else {
    console.error('Invalid directory path.');
    process.exit(1);
  }

  return combinedData;
}

if (process.argv.length !== 3) {
  console.error('Usage: node yaml_to_json_converter.js <yaml_directory_or_file>');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputData = fs.statSync(inputPath).isDirectory() ? combineJsonFiles(inputPath) : convertYamlToJson(inputPath);

console.log(JSON.stringify(outputData, null, 2));
