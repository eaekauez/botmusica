function stamp() {
  return new Date().toISOString();
}

module.exports = {
  info(message, extra) {
    console.log(`[${stamp()}] INFO  ${message}`, extra || '');
  },
  warn(message, extra) {
    console.warn(`[${stamp()}] WARN  ${message}`, extra || '');
  },
  error(message, extra) {
    console.error(`[${stamp()}] ERROR ${message}`, extra || '');
  },
};
