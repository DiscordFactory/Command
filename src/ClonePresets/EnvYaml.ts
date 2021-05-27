export default `
APP_TOKEN: "$APP_TOKEN"
APP_PREFIX: "$APP_PREFIX"

PARTIALS:
  $PARTIALS

PRESETS:
  COMMAND_AUTO_REMOVE: true

MESSAGES:
  COMMAND_MISSING_PERMISSION: "You're not authorized to execute this command"
  COMMAND_MISSING_ROLES: "You're not authorized to execute this command"
  ENVIRONMENT_FILE_PREFIX_MISSING: "The prefix is missing in the environment file."
  ENVIRONMENT_FILE_TOKEN_MISSING: "The token is missing in the environment file."
  ENVIRONMENT_FILE_MISSING: "Environment file is missing, please create one."
`