// Cut a release for one package: bump its version, verify its CHANGELOG.md
// section exists, commit, tag <pkg-name>@<version>, and push main + the tag.
// The tag push triggers .github/workflows/publish.yml for that package only.
//
// Usage: pnpm release <react|icons> <version>   (e.g. `pnpm release react 0.0.2`)

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const PACKAGES = { react: "packages/react", icons: "packages/icons" };

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const [name, rawVersion] = process.argv.slice(2);
const dir = PACKAGES[name];
const version = (rawVersion ?? "").replace(/^v/, "");
if (!dir || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  fail("usage: pnpm release <react|icons> <version>");
}
const run = (cmd, ...args) => execFileSync(cmd, args, { encoding: "utf8" }).trim();
const git = (...args) => run("git", ...args);

const [{ name: pkgName }] = JSON.parse(
  run("pnpm", "ls", "--filter", `./${dir}`, "--depth", "-1", "--json"),
);
const tag = `${pkgName}@${version}`;

if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") fail("Releases are cut from main.");
if (git("status", "--porcelain") !== "") fail("Working tree is not clean.");
if (git("tag", "--list", tag) !== "") fail(`Tag ${tag} already exists.`);

// Fails (non-zero exit) if the section is missing or empty.
execFileSync("node", ["scripts/extract-changelog.mjs", version, `${dir}/CHANGELOG.md`], {
  stdio: ["ignore", "ignore", "inherit"],
});

const path = `${dir}/package.json`;
const pkg = JSON.parse(readFileSync(path, "utf8"));
if (pkg.version === version) {
  console.log(`${pkgName} is already at ${version} — tagging HEAD without a bump commit.`);
} else {
  pkg.version = version;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
  git("add", path);
  git("commit", "-m", tag);
}
git("tag", "-a", tag, "-m", tag);
git("push", "origin", "main", tag);
console.log(`Released ${tag} — publish workflow is running.`);
