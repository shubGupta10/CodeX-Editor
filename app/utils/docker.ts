import { storage, ref, uploadBytes, getDownloadURL } from "@/firebase/FirebaseConfig";
import { exec } from "child_process";
import { promisify } from "util";
import { supportedLanguages } from "./languages";
import { v4 as uuidv4 } from "uuid";

const execPromise = promisify(exec);

const languageExtensions: Record<string, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  java: "java",
  c: "c",
  cpp: "cpp",
};

export async function executeCodeInDocker(code: string, language: string) {
  try {
    console.log("📝 Code to execute:", code);
    
    const langConfig = supportedLanguages[language];
    if (!langConfig) throw new Error("Language not supported");

    const fileExtension = languageExtensions[language] || language;
    const filename = `scripts/${uuidv4()}/script.${fileExtension}`;
    const storageRef = ref(storage, filename);

    // Add debug content markers
    const codeWithMarkers = `// === START OF CODE ===\n${code}\n// === END OF CODE ===`;

    const codeBlob = new Blob([codeWithMarkers], { type: "text/plain" });
    await uploadBytes(storageRef, codeBlob);
    console.log(`✅ Uploaded script to Firebase: ${filename}`);

    const url = await getDownloadURL(storageRef);
    console.log(`🔗 Script URL: ${url}`);

    // Fixed Docker command to be a single line
    const dockerCommand = `docker run --rm ${langConfig.image} /bin/bash -c "set -e && mkdir -p /app && curl -L -o /app/script.${fileExtension} '${url}' && echo '=== Content of script ===' && cat /app/script.${fileExtension} && echo '=== Running script ===' && ${langConfig.command} && echo '=== Execution completed ==='"`;

    console.log(`🚀 Docker command:`, dockerCommand);

    const { stdout, stderr } = await execPromise(dockerCommand, {
      maxBuffer: 1024 * 1024 // Increase buffer size to 1MB
    });
    
    console.log("=== STDOUT ===");
    console.log(stdout);
    console.log("=== STDERR ===");
    console.log(stderr);

    if (stderr && !stderr.includes('% Total')) {
      return { 
        output: "", 
        error: stderr.trim() 
      };
    }

    // Extract actual output from between the markers
    const outputMatch = stdout.match(/=== Running script ===\n([\s\S]*?)\n=== Execution completed ===/);
    const actualOutput = outputMatch ? outputMatch[1].trim() : stdout.trim();

    return { 
      output: actualOutput,
      error: "" 
    };

  } catch (error: any) {
    console.error("❌ Execution failed:", error);
    const errorMessage = error.stderr || error.message;
    return { 
      output: "", 
      error: `Execution failed: ${errorMessage}` 
    };
  }
}