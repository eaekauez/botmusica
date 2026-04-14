class Track {
  constructor({ title, url, sourceUrl, requestedBy, durationSeconds = 0 }) {
    this.title = title;
    this.url = url;
    this.sourceUrl = sourceUrl || url;
    this.requestedBy = requestedBy;
    this.durationSeconds = durationSeconds;
  }

  durationLabel() {
    if (!this.durationSeconds || Number.isNaN(this.durationSeconds)) {
      return 'ao vivo/indefinido';
    }

    const total = Math.max(0, Math.floor(this.durationSeconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

module.exports = { Track };
