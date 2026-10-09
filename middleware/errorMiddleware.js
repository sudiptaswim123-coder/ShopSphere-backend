export function notFound(request, _response, next) { next(Object.assign(new Error(`Not found: ${request.originalUrl}`), { status: 404 })) }
export function errorHandler(error, _request, response, _next) {
  const status = error.status || (error.name === 'ValidationError' ? 400 : error.name === 'CastError' ? 404 : 500)
  response.status(status).json({ message: error.code === 11000 ? 'An account with this email already exists' : error.message || 'Server error' })
}