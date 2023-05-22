# UGC movies

![status](https://github.com/tbourrely/ugc-movies/actions/workflows/workflow.yaml/badge.svg)

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
yarn bot:dev # run with nodemon
# or
yarn bot:prod # run with pm2
```

### Update commands (dispatch changes to discord API)

```
yarn deploy_commands
```

## Available commands

> At the moment, commands are developed with french users in mind.

### cinemas

List supported theaters

Usage:

```
/cinemas
```

### films

Get the list of movies available in a theater.

You can filter by theater, date, start time, language.

Usage:

```
/films <cinema> <date> <debut> <langue>
```

Default values:
- `cinema`: `null`, will fetch data to all theaters and merge the results
- `date`: `null`, get **next day** movie list
- `debut`: `null`, no filtering applied
- `langue`: `null`, no filtering applied
