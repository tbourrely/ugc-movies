# parse-ugc

## Getting started

### Setup

Clone and install packages:

```
git clone git@github.com:tbourrely/ugc-movies.git
cd ugc-movies
yarn
```

Create config file:

```
touch config.json
```

Add the following elements to it:

- `token`: your bot token
- `guildId`: your server id
- `clientId`: your application client id

### Run tests

```
yarn test
# or with watch mode :
yarn test:watch
```

### Run linter

```
yarn lint
# or to also fix :
yarn lint:fix
```

### Run bot

```
yarn bot
```

### Update commands (dispatch changes to discord API)

```
yarn deploy_commands
```

## Available commands

### cinemas

List supported theaters

### films

Get the list of movies available in a theater.

You can filter by start time, language and search for a given date.
