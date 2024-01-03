// Validate companies using JSON Schema

const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const Ajv = require("ajv");

const companiesDatasetDir = path.join(__dirname, "../../", "dataset/companies");
const companySchema = path.join(
  __dirname,
  "../../",
  "validators/companies/company-schema.yaml"
);

// Load and parse YAML schema file
const schemaFile = fs.readFileSync(companySchema, "utf8");
const schema = yaml.parse(schemaFile);

// Create an Ajv instance
const ajv = new Ajv();
const validate = ajv.compile(schema);

// Get all categories (company files)
const categories = fs.readdirSync(companiesDatasetDir);

// Validate files 1 by 1
for (category of categories) {
  const companies = fs.readFileSync(
    `${companiesDatasetDir}/${category}`,
    "utf8"
  );
  const data = yaml.parse(companies);

  const valid = validate(data);
  if (!valid) {
    console.log("Validation errors:", validate.errors);
    process.exit(1);
  }
}

console.log("YAML data is valid!");
