function formatTimestamps(selector = '.local-date') {
  if (typeof Temporal === 'undefined') {
    return;
  }

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  const timeZone = Temporal.Now.timeZoneId();
  // en-CA to use YYYY-MM-DD format
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // timeZoneName: 'short',
    timeZone: timeZone,
  });

  elements.forEach((element) => {
    const datetime = element.getAttribute('datetime');
    if (!datetime) return;

    try {
      const instant = Temporal.Instant.from(datetime);
      element.textContent = formatter.format(instant);
    } catch (e) {
      console.warn('Failed to format timestamp for:', element, e);
    }
  });
}

formatTimestamps();
