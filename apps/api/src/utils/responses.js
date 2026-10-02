/**
 * Response helpers.
 *
 * The original server responded with raw Mongo results and with ad-hoc
 * `{ message }` objects for errors. Both shapes are kept intact so the existing
 * React client keeps working, but the construction now lives in one place.
 */

function unauthorized(res, message = "unauthorized access") {
  return res.status(401).send({ message });
}

function forbidden(res, message = "forbidden access") {
  return res.status(403).send({ message });
}

function notFound(res, message = "resource not found") {
  return res.status(404).send({ message, code: "NOT_FOUND" });
}

function badRequest(res, message) {
  return res.status(400).send({ message });
}

module.exports = { unauthorized, forbidden, notFound, badRequest };
