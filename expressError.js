/** 
 * ExpressError extends the normal JS error so we can easily
 * add a status when we make an instance of it.
 *
 * The error-handling middleware will return this.
 */

class ExpressError extends Error {
  /**
   * Create an ExpressError.
   * @param {string} message - Error message.
   * @param {number} [status=500] - HTTP status code.
   */
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = ExpressError;
