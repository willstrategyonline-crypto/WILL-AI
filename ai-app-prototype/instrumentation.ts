export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { cleanupOldUploads } = await import("./lib/uploads");
    const result = await cleanupOldUploads({ force: true });
    if (result.deleted > 0) {
      console.log(`[uploads] Startup cleanup: removed ${result.deleted} expired file(s)`);
    }
  }
}
