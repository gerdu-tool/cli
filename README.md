Gerdu
========

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/gerdu-tool/cli/blob/main/LICENSE)
[![build-and-test](https://github.com/gerdu-tool/cli/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/gerdu-tool/cli/actions/workflows/build-and-test.yml)
[![npm version](https://badge.fury.io/js/@gerdu%2Fcli.svg)](https://badge.fury.io/js/@gerdu%2Fcli)

[![NPM](https://nodei.co/npm/@gerdu/cli.png?mini=true)](https://npmjs.org/package/@gerdu/cli)

Gerdu is an open-source tool for running and managing multi docker-compose applications on Docker defined using the Gerdu file format. Once you have Configuration files, you can create and start your applications with a single command: `gerdu up`

Gerdu heavily realies on `docker-compose` spec to deploy application locally. 

Where to get Gerdu
----------------------------
### Using `npm`

1. Make sure [Node](https://nodejs.org/en/download/package-manager/) are installed, test with the following commands:

```console
$ node -v
EX: v16.0.0

$ npm -v
EX: 7.10.0
```

2. Install Gerdu cli
```console
$ npm install @gerdu/cli -g
```

### Using `yarn`

1. Make sure [Yarn](https://classic.yarnpkg.com/en/docs/cli/install/) & [Node](https://nodejs.org/en/download/package-manager/) are installed, test with the following commands:

```console
$ node -v
EX: v16.0.0

$ yarn -v
EX: 1.22.10
```

2. Install Gerdu cli
```console
$ yarn global add @gerdu/cli -g
```

> **Note:** Gerdu cli requires Node 14 or later.

Quick Start
-----------

Using Gerdu cli is basically a three-step process:
1. Define your workspace.
2. Define your charts, which contains `repository` and `docker-compose` configurations.
3. Lastly, run `gerdu install` and `gerdu up`. Gerdu will install and starts your entire workspace. 

A Workspace is a directory contains `.gerdu.yaml` file which looks like this:

```yaml
# .gerdu.yaml

version: "1.0"

name: "awesome-workspace"

charts:
  - ./chart1.yaml
  - ./chart2.yaml
  - ./chart3.yaml

profiles:
  profile1:
    - service1
    - service1_db
```

Every charts represents a `docker-compose` file with some extera configs:
```yaml
version: "1.0"

name: my-chart

# gerdu pull will use this configs to clone service
repo:
  git: git@github.com:username/my-project.git
  branch: main
  path: my-project


# Gerdu will execute stages as part of installation process
stages:
  pull:
    - echo "command1"
    - echo "command2"
    - echo "command3"
  sync:
    - echo "command1"
  setup:
    - echo "command1"

# Gerdu will map the urls to the services
mappings:
  api:
    port: 8080
    path: /hello
    service: hello-world
    host: api.gerdu.local
    cors:
      allowOrigins: *
      allowCredentials: fasle
      allowHeaders: Content-Type,Authorization
      allowMethods: GET,PUT,POST,PATCH,DELETE,OPTIONS

# docker-compose spec
compose:
  version: "3.9"
  services:
    hello-world:
      image: hello-world
```

Once you prepared your workspace and chart files, you can register it in `Gerdu`:
```console
# add workspace to gerdu
$ gerdu ws add awesome /work/awesome-workspace

# activate workspace
$ gerdu ws switch awesome

# set dns records
$ sudo gerdu proxy dns > /etc/hosts
```


Now Gerdu is ready to run your applications:
```console
$ gerdu up
```

CLI
-----------

### Workspace commands

- `$ gerdu ws list` list all workspaces
- `$ gerdu ws add <name> <path>` add an existing workspace
- `$ gerdu ws swtich <name>` switch to workspace

### Setup commands
- `$ gerdu install` install charts
- `$ gerdu pull` pull charts
- `$ gerdu sync` sync charts
- `$ gerdu setup [charts...]` setup charts or services

### Compose commands
- `$ gerdu build [services...] [-p <profiles...>]` build or rebuild services
- `$ gerdu up [services...] [-p <profiles...>]` starts services
- `$ gerdu down [services...] [-p <profiles...>]` stops and removes services
- `$ gerdu kill <args...>` force stops services
- `$ gerdu stop <args...>` stops services
- `$ gerdu run <args...>` run a one-off command
- `$ gerdu exec <args...>` executes a command in a running service
- `$ gerdu ps <args...>` lists running containers
- `$ gerdu compose <args...>` docker compose alias

### Proxy commands
- `$ gerdu proxy up` starts proxy service
- `$ gerdu proxy down` stops proxy services
- `$ gerdu proxy ls` lists all mappings
- `$ gerdu proxy dns [-w]` generates dns records

Contributing
------------

Want to help develop Docker Compose? Check out our
[contributing documentation](https://github.com/gerdu-tool/cli/blob/main/CONTRIBUTING.md).

If you find an issue, please report it on the
[issue tracker](https://github.com/gerdu-tool/cli/issues/new/choose).