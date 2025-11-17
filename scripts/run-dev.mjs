import { spawn } from "node:child_process";
import { platform } from "node:os";

const cleanEnv = { ...process.env };

for (const key of [
  "npm_config_verify_deps_before_run",
  "NPM_CONFIG_VERIFY_DEPS_BEFORE_RUN",
  "npm_config__jsr_registry",
  "NPM_CONFIG__JSR_REGISTRY",
]) {
  if (key in cleanEnv) {
    delete cleanEnv[key];
  }
}

// Windows 兼容性修复: Windows 需要 .cmd 扩展名和 shell
const isWindows = platform() === "win32";
const command = isWindows ? "next.cmd" : "next";

const child = spawn(command, ["dev"], {
  stdio: "inherit",
  env: cleanEnv,
  shell: isWindows,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
