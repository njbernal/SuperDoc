/**
 * @typedef {Object} BaseEvent
 * @property {string} id - Unique event identifier
 * @property {string} timestamp - ISO timestamp of the event
 * @property {string} sessionId - Current session identifier
 * @property {string} superdocId - SuperDoc ID
 * @property {Object} document - Document information
 * @property {string} [document.id] - Reference ID
 * @property {string} [document.type] - Document type
 * @property {string} [document.internalId] - Internal document ID
 * @property {string} [document.hash] - Document CRC32 hash
 * @property {string} [document.lastModified] - Last modified timestamp
 */

/**
 * @typedef {Object} UsageEvent
 * @param {File} fileSource - File object
 * @param {string} documentId - document id
 * @property {string} name - Name of the usage event
 * @property {Object.<string, *>} properties - Event properties
 */

/**
 * @typedef {Object} ParsingEvent
 * @param {File} fileSource - File object
 * @param {string} documentId - document id
 * @property {'mark'|'element'} category - Category of the parsed item
 * @property {string} name - Name of the parsed item
 * @property {string} path - Document path where item was found
 * @property {Object.<string, *>} [metadata] - Additional context
 */

/** @typedef {(UsageEvent & BaseEvent) | (ParsingEvent & BaseEvent)} TelemetryEvent */

/**
 * @typedef {Object} TelemetryConfig
 * @property {string} [licenceKey] - Licence key for telemetry service
 * @property {boolean} [enabled=true] - Whether telemetry is enabled
 * @property {string} endpoint - service endpoint
 * @property {string} superdocId - SuperDoc id
 */

import crc32 from 'buffer-crc32';
import { randomBytes } from 'crypto';

class Telemetry {
  /** @type {boolean} */
  enabled;

  /** @type {string} */
  superdocId;

  /** @type {string} */
  licenseKey;

  /** @type {string} */
  endpoint;

  /** @type {string} */
  sessionId;

  /** @type {TelemetryEvent[]} */
  events = [];

  /** @type {number|undefined} */
  flushInterval;

  /** @type {number} */
  static BATCH_SIZE = 50;

  /** @type {number} */
  static FLUSH_INTERVAL = 10000; // 30 seconds

  /** @type {string} */
  static COMMUNITY_LICENSE_KEY = 'community-and-eval-agplv3';

  /** @type {string} */
  static DEFAULT_ENDPOINT = 'https://ingest.superdoc.dev/v1/collect';

  /**
   * Initialize telemetry service
   * @param {TelemetryConfig} config
   */
  constructor(config = {}) {
    this.enabled = config.enabled ?? true;

    this.licenseKey = config.licenceKey ?? Telemetry.COMMUNITY_LICENSE_KEY;
    this.endpoint = config.endpoint ?? Telemetry.DEFAULT_ENDPOINT;
    this.superdocId = config.superdocId;

    this.sessionId = this.generateId();

    if (this.enabled) {
      this.startPeriodicFlush();
    }
  }

  /**
   * Create source payload for request
   */
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
   * @param {File} fileSource - File object
   * @param {string} documentId - document id
   * @param {string} name - Name of the feature/event
   * @param {Object.<string, *>} [properties] - Additional properties
   */
  async trackUsage(fileSource, documentId, name, properties = {}) {
    if (!this.enabled) return;

    const processedDoc = await this.processDocument(fileSource, {
      id: documentId,
      internalId: properties.internalId,
    });

    /** @type {UsageEvent & BaseEvent} */
    const event = {
      id: this.generateId(),
      type: 'usage',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      superdocId: this.superdocId,
      source: this.getSourceData(),
      document: processedDoc,
      name,
      properties,
    };

    this.queueEvent(event);
  }

  /**
   * Track parsing events
   * @param {File} fileSource - File object
   * @param {string} documentId - document id
   * @param {'mark'|'element'} category - Category of parsed item
   * @param {string} name - Name of the item
   * @param {string} path - Document path where item was found
   * @param {Object.<string, *>} [metadata] - Additional context
   */
  async trackParsing(fileSource, documentId, category, name, path, metadata) {
    if (!this.enabled) return;

    const processedDoc = await this.processDocument(fileSource, {
      id: documentId,
      internalId: metadata.internalId,
    });

    /** @type {ParsingEvent & BaseEvent} */
    const event = {
      id: this.generateId(),
      type: 'parsing',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      superdocId: this.superdocId,
      source: this.getSourceData(),
      category,
      document: processedDoc,
      name,
      path,
      ...(metadata && { metadata }),
    };

    this.queueEvent(event);
  }

  /**
   * Process document metadata
   * @param {File} file - Document file
   * @param {Object} options - Additional metadata options
   * @returns {Promise<Object>} Document metadata
   */
  async processDocument(file, options = {}) {
    let hash = '';
    try {
      hash = await this.generateCrc32Hash(file);
    } catch (error) {
      console.error('Failed to retrieve file hash:', error);
    }
    
    return {
      id: options.id,
      type: options.type || file.type,
      internalId: options.internalId,
      hash,
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
    };
  }

  /**
   * Generate CRC32 hash for a file
   * @param {File} file - File to hash
   * @returns {Promise<string>} CRC32 hash
   * @private
   */
  async generateCrc32Hash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hashBuffer = crc32(buffer);
    const hashArray = Array.from(hashBuffer);
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Queue event for sending
   * @param {TelemetryEvent} event
   * @private
   */
  queueEvent(event) {
    this.events.push(event);

    if (this.events.length >= Telemetry.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush queued events to server
   * @returns {Promise<void>}
   */
  async flush() {
    if (!this.enabled || !this.events.length) return;

    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': this.licenseKey,
        },
        body: JSON.stringify(eventsToSend),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload telemetry:', error);
      // Add events back to queue
      this.events = [...eventsToSend, ...this.events];
    }
  }

  /**
   * Start periodic flush interval
   * @private
   */
  startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, Telemetry.FLUSH_INTERVAL);
  }
  
  /**
   * Generate unique identifier
   * @returns {string}
   * @private
   */
  generateId() {
    const randomValue = randomBytes(4).toString('hex');
    return `${Date.now()}-${randomValue}`;
  }

  /**
   * Clean up telemetry service
   * @returns {Promise<void>}
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    return this.flush();
  }
}

export { Telemetry };
