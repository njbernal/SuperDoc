/**
 * @typedef {Object} BaseEvent
 * @property {string} id - Unique event identifier
 * @property {string} timestamp - ISO timestamp of the event
 * @property {string} sessionId - Current session identifier
 * @property {Object} document - Document information
 * @property {string} [document.id] - Reference ID
 * @property {string} [document.type] - Document type
 * @property {string} [document.internalId] - Internal document ID
 * @property {string} [document.hash] - Document MD5 hash
 * @property {string} [document.lastModified] - Last modified timestamp
 */

/**
 * @typedef {Object} UsageEvent
 * @property {'usage'} type - Event type identifier
 * @property {string} name - Name of the usage event
 * @property {Object.<string, *>} properties - Event properties
 */

/**
 * @typedef {Object} ParsingEvent
 * @property {'parsing'} type - Event type identifier
 * @property {'mark'|'element'} category - Category of the parsed item
 * @property {string} name - Name of the parsed item
 * @property {string} path - Document path where item was found
 * @property {Object.<string, *>} [metadata] - Additional context
 */

/** @typedef {(UsageEvent & BaseEvent) | (ParsingEvent & BaseEvent)} TelemetryEvent */

/**
 * @typedef {Object} TelemetryConfig
 * @property {string} [dsn] - Data Source Name for telemetry service
 * @property {string} [endpoint] - Optional override for telemetry endpoint
 * @property {boolean} [enabled=true] - Whether telemetry is enabled
 * @property {File} [fileSource] - current editor file
 * @property {string} documentId - Reference ID
 */

class Telemetry {
  /** @type {boolean} */
  #enabled;

  /** @type {string} */
  #endpoint;

  /** @type {string} */
  #projectId;

  /** @type {string} */
  #token;

  /** @type {object} */
  #document;

  /** @type {string} */
  #sessionId;

  /** @type {TelemetryEvent[]} */
  #events = [];

  /** @type {number|undefined} */
  #flushInterval;

  /** @type {number} */
  static BATCH_SIZE = 50;

  /** @type {number} */
  static FLUSH_INTERVAL = 5000; // 30 seconds

  /** @type {string} */
  static COMMUNITY_DSN = 'https://public@telemetry.superdoc.dev/community';

  /**
   * Initialize telemetry service
   * @param {TelemetryConfig} config
   */
  constructor(config = {}) {
    this.#enabled = config.enabled ?? true;

    try {
      const dsn = config.dsn ?? Telemetry.COMMUNITY_DSN;
      this.initTelemetry(config, dsn);
    } catch (error) {
      console.warn('Invalid telemetry configuration, enabling community version:', error);
      if (config.dsn) this.initTelemetry(config, Telemetry.COMMUNITY_DSN);
      return;
    }

    this.#sessionId = this.#generateId();

    if (this.#enabled) {
      this.#startPeriodicFlush();
    }
  }

  /**
   * Init variables
   * @param {TelemetryConfig} config
   * @param {string} dsn - Data Source Name for telemetry service
   */
  async initTelemetry(config, dsn) {
    const { projectId, token, endpoint } = this.#parseDsn(dsn);
    this.#projectId = projectId;
    this.#token = token;
    this.#endpoint = config.endpoint ?? endpoint;
    this.#document = await this.processDocument(config.fileSource, {
      id: config.documentId,
    });
  }
  
  
  getSourceData() {
    return {
      userAgent: window.navigator.userAgent,
      url: window.location.href,
      host: window.location.host,
      referrer: document.referrer,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  /**
   * Track feature usage
   * @param {string} name - Name of the feature/event
   * @param {Object.<string, *>} [properties] - Additional properties
   */
  trackUsage(name, properties = {}) {
    if (!this.#enabled) return;

    /** @type {UsageEvent & BaseEvent} */
    const event = {
      id: this.#generateId(),
      type: 'usage',
      timestamp: new Date().toISOString(),
      sessionId: this.#sessionId,
      source: this.getSourceData(),
      name,
      document: this.#document,
      properties,
    };

    this.#queueEvent(event);
  }

  /**
   * Track parsing events
   * @param {'mark'|'element'} category - Category of parsed item
   * @param {string} name - Name of the item
   * @param {string} path - Document path where item was found
   * @param {Object.<string, *>} [metadata] - Additional context
   */
  trackParsing(category, name, path, metadata) {
    if (!this.#enabled) return;

    /** @type {ParsingEvent & BaseEvent} */
    const event = {
      id: this.#generateId(),
      type: 'parsing',
      timestamp: new Date().toISOString(),
      sessionId: this.#sessionId,
      source: this.getSourceData(),
      category,
      name,
      path,
      document: this.#document,
      ...(metadata && { metadata }),
    };

    this.#queueEvent(event);
  }

  /**
   * Process document metadata
   * @param {File} file - Document file
   * @param {Object} options - Additional metadata options
   * @returns {Promise<Object>} Document metadata
   */
  async processDocument(file, options = {}) {
    try {
      const hash = await this.#generateMD5Hash(file);
      
      return {
        id: options.id,
        type: options.type || file.type,
        internalId: options.internalId,
        hash,
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      };
    } catch (error) {
      return {
        id: options.id,
        type: options.type || file.type,
        internalId: options.internalId,
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      }
    }
  }

  /**
   * Generate MD5 hash for a file
   * @param {File} file - File to hash
   * @returns {Promise<string>} MD5 hash
   * @private
   */
  async #generateMD5Hash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Queue event for sending
   * @param {TelemetryEvent} event
   * @private
   */
  #queueEvent(event) {
    this.#events.push(event);

    if (this.#events.length >= Telemetry.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush queued events to server
   * @returns {Promise<void>}
   */
  async flush() {
    if (!this.#enabled || this.#events.length === 0) return;

    const eventsToSend = [...this.#events];
    this.#events = [];

    try {
      const response = await fetch(this.#endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-ID': this.#projectId,
          'X-Token': this.#token,
        },
        body: JSON.stringify(eventsToSend),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload telemetry:', error);
      // Add events back to queue
      this.#events = [...eventsToSend, ...this.#events];
    }
  }

  /**
   * Start periodic flush interval
   * @private
   */
  #startPeriodicFlush() {
    this.#flushInterval = setInterval(() => {
      if (this.#events.length > 0) {
        this.flush();
      }
    }, Telemetry.FLUSH_INTERVAL);
  }

  /**
   * Parse DSN string into config
   * @param {string} dsn
   * @returns {{ projectId: string, token: string, endpoint: string }}
   * @private
   */
  #parseDsn(dsn) {
    try {
      const url = new URL(dsn);
      return {
        token: url.username,
        projectId: url.pathname.split('/')[1],
        endpoint: `${url.protocol}//${url.host}/v1/collect`,
      };
    } catch (error) {
      throw new Error(`Invalid DSN: ${error.message}`);
    }
  }

  /**
   * Generate unique identifier
   * @returns {string}
   * @private
   */
  #generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clean up telemetry service
   * @returns {Promise<void>}
   */
  destroy() {
    if (this.#flushInterval) {
      clearInterval(this.#flushInterval);
    }
    return this.flush();
  }
}

export { Telemetry };
