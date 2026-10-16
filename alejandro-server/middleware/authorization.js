const { HttpStatus } = require("../config/constants");

module.exports = (...roles) => {
  return async (request, response, next) => {
    try {
      if (!request.user || !request.user.role) {
        return response.status(HttpStatus.FORBIDDEN).json({
          error: new Error("Access denied: No role found"),
        });
      }
      
      const userRole = request.user.role.toLowerCase();
      const normalizedRoles = roles.map(role => role.toLowerCase());

      if (!normalizedRoles.includes(userRole)) {
        return response.status(HttpStatus.FORBIDDEN).json({
          error: new Error("Access denied"),
        });
      }
      next();
    } catch (error) {
      response.status(HttpStatus.FORBIDDEN).json({
        error: new Error("Access denied"),
      });
    }
  };
};