---
title: Packaging Node.js Apps for Easy Deployment
author: jeff
date: 2016-04-19 15:55
template: article.jade
---

After 5 years in Node land, there's nothing sadder than taking hours
to deploy your new app. It was a breeze to develop and run locally.
Throwing it on staging or production can become a beast of a task
if you aren't careful. There are so many guides with complicated deploy and server setup patterns, because Node and npm, plus build tools need to be installed on the server.

Easy deploys and easy rollbacks are my goal here. I usually just
don't want to hassle with a bunch of infrastructure. Docker is
probably a nice tool if you have 50 servers, but that isn't the
case for most of us.

## What I am not using

### nexe

- wonderful tool for producing small-ish Node executables
- project mainentance has become questionable and it breaks a lot
- native modules don't work, despite what they may hint at


### jxcore

- compile your node app into a binary
- more of a node.js competitor than node.js tool
- for me, broke a lot and feels early days (
    for example, at the time of writing, their website is unreachable,
    which is not a surprise)

### nw.js (formerly node-webkit)

- awesome toolset for making desktop node apps
- build on one platform for another platform
- smallest archive size is around 80mb
- does not really work from the terminal
- you can launch in background mode, but not primary use case

### electron and electron ecosystem

- TBD
- also desktop-focused

## What I use - `nar`

[`nar`](https://github.com/h2non/nar) probably stands for "node
archive" but who knows.

This tool just works. With it, you can package a node.js app
into an executable archive. It compresses pretty small - I have
decent sized express APIs that are around 15mb - 20mb.

You can actually build it on OSX, specify Linux as the target, and deploy to Linux - and it works.

## Deployment workflow using `nar`

1. build the executable
1. `scp` the executable to the server
1. (optional) add a startup script
1. (optional) add logrotate script

Things we don't have to really do:
- build on the deployment environment
- npm install
- archive the app for transfer
- install node and npm, build-essentials or whatever, on the app server

I consider `nar` a huge win for easy deployments because you can deploy to a fresh server from your local machine, like heroku or modulus, but using cheap VPS boxes.
