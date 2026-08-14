import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const mode = (process.argv[2] ?? "local") as
  "local" | "docker" | "production" | "ci";

const requiredVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

function readEnv(name: (typeof requiredVars)[number]) {
  return process.env[name]?.trim() ?? "";
}

function redactConnectionString(value: string) {
  try {
    const url = new URL(value);

    if (url.password) {
      url.password = "***";
    }

    if (url.username) {
      url.username = "***";
    }

    return url.toString();
  } catch {
    return "<invalid connection string>";
  }
}

function fail(message: string) {
  console.error(`Environment check failed: ${message}`);
  process.exit(1);
}

function assertPresent(name: (typeof requiredVars)[number], value: string) {
  if (!value) {
    fail(`${name} is required for ${mode} mode.`);
  }
}

function assertNotPlaceholder(
  name: (typeof requiredVars)[number],
  value: string
) {
  if (value.includes("replace_me") || value.includes("USER:PASSWORD")) {
    fail(`${name} is still using the example placeholder for ${mode} mode.`);
  }
}

function assertIncludes(
  name: "DATABASE_URL" | "DIRECT_URL",
  value: string,
  expected: string
) {
  if (!value.includes(expected)) {
    fail(`${name} should include "${expected}" in ${mode} mode.`);
  }
}

function printSummary() {
  console.log(`Environment check passed for ${mode}.`);
  console.log(
    `DATABASE_URL=${redactConnectionString(readEnv("DATABASE_URL"))}`
  );
  console.log(`DIRECT_URL=${redactConnectionString(readEnv("DIRECT_URL"))}`);
  console.log(
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${readEnv(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    ).slice(0, 12)}...`
  );
  console.log(`CLERK_SECRET_KEY=<redacted>`);
}

for (const name of requiredVars) {
  const value = readEnv(name);
  assertPresent(name, value);
  assertNotPlaceholder(name, value);
}

const databaseUrl = readEnv("DATABASE_URL");
const directUrl = readEnv("DIRECT_URL");

switch (mode) {
  case "docker":
    assertIncludes("DATABASE_URL", databaseUrl, "@postgres:5432");
    assertIncludes("DIRECT_URL", directUrl, "@postgres:5432");
    break;
  case "ci":
    assertIncludes("DATABASE_URL", databaseUrl, "127.0.0.1:5432");
    assertIncludes("DIRECT_URL", directUrl, "127.0.0.1:5432");
    break;
  case "production":
    if (databaseUrl.includes("localhost") || directUrl.includes("localhost")) {
      fail("Production checks should not point at localhost.");
    }
    break;
  case "local":
  default:
    break;
}

printSummary();
