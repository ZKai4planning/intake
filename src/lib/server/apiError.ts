/**
 * Thrown anywhere in the auth routes/services to produce a consistent
 * { error, message } JSON body — see lib/api.ts on the client, which
 * reads json?.message ?? json?.error on a non-2xx response, and
 * json?.error for the stable `code` (e.g. to auto-detect signup vs.
 * login without an extra round trip).
 */
export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, message: string, code = 'error') {
    super(message)
    this.status = status
    this.code = code
  }

  static badRequest(message: string, code = 'bad_request') {
    return new ApiError(400, message, code)
  }
  static unauthorized(message = 'Unauthorized', code = 'unauthorized') {
    return new ApiError(401, message, code)
  }
  static forbidden(message = 'Forbidden', code = 'forbidden') {
    return new ApiError(403, message, code)
  }
  static notFound(message = 'Not found', code = 'not_found') {
    return new ApiError(404, message, code)
  }
  static tooMany(message = 'Too many requests', code = 'rate_limited') {
    return new ApiError(429, message, code)
  }
}
