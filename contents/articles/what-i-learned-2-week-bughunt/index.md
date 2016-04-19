---
title: What I Learned in a Two Week Microservice Bug Hunt
author: jeff
date: 2016-04-15 11:30
template: article.jade
---

After a few years building platforms using (mostly) Node.js microservices,
I thought I could troubleshoot problematic situations in minimal time,
regardless of coding style, or lack thereof. It turns out - *nope*.

## The two week bug hunt

There was this tiny bug where occasionally, a group-routed phone call displayed as
if someone else answered. Should be easy to find. Except call logs touch several services:

- service for doing the calls and mashing data from the call into call logs
- internal service for CRUDding the call logs
- external gateway api for pulling back calls that massages and transforms the data
- native app display
- 2 databases

## Tripup One: complex local environment setup

We skipped setting things up with docker-compose or another tool that will spin up the whole
environment locally, in one command. This is a must, these days. It would take 7 terminals
to fire up the whole environment, plus a few databases and background services -
and each service needs its own local config. There
would still be phone service dependencies (this would be mocked in an ideal world) and
external messaging dependencies (Respoke).

Not being able to spin up the whole environment means you better have excellent logging.

## Tripup Two: not enough logging

Aggregated logs are the lifeblood of microservices, especially dockerized or load-balanced ones.

We use the ELK stack for log management. Elasticsearch, Logstash, and Kibana are wonderful
tools when they have consumed all server resources and blocked the user interface processing data.

For these particular bugs, there was insufficient logging, and the problems only occurred
when all of the microservices talked together. Because we have some special Asterisk hardware
and phone number providers, it is a lot of work (if not impossible) to spin up the entire
environment locally.

Thus, at first I started by adding a few logs here and there in the service. It was a round of
Add Logs - PR - Deploy - Test - Add Logs - PR - Deploy - Test. Eventually I just added
a ton of logging, everywhere.

I have this fear that I will add _too much_ logging and it will cause things to go down, or
get in the way. With few exceptions, **you can't have too much logging** when things break.
You can have bad log search. Also, at this point I have decided that the ELK stack will
always consume all resources, so you might as well log everything anyways.

## Tripup Three: forgotten internal supporting library

There was an internal library, written in the early days of the project, which had:

- a unique coding style
- no tests
- poor commit messages
- no comments
- generic naming of variables and methods
- several basic bugs in unused code paths

As it turned out, none of the bugs in this library were causing problems because those code
paths were not in use. Nonetheless, I spent a full day understanding it.

## Tripup Four: code generation in functional and unit tests

I am a firm believer, now, that DRY (don't repeat yourself) has no place in unit tests,
and probably not in functional tests either. Here are common things I ran into:

- test setup has multiple layers of `describe() and each has beforeEach()`
- `beforeEach()` blocks used factories which assigned many values to `uuid.v4()`, then
further manipulated the output
- layers of generated test values are impossible to debug

It's best just to be explicit. Use string literals everywhere in unit tests. Minimize or eliminate
nested `describe()`s.

## Tripup Five: too much logic in one spot

In Node.js land, there's no reason to have functions with complexity higher than 6 or 7 because
adding a utility or library is cheap. It takes little effort to extract things into smaller
and smaller functions, and use explicit and specific naming.

We had a ton of logic in Express routes/controllers. This is hard to unit test, because
the realistic way to get at that logic is using `supertest` over mock HTTP.
It's better to make small functions and unit test input-output on those functions.

## Conclusion

Eventually, I never found the bug - I found four, after careful refactoring of code and tests to
the tune of several thousand SLOC.

The actual bug could have been only a one-line-fix, but finding it took weeks of coding.

Situations like this are often unavoidable. I am sure if I haven't inflicted similar situations
on colleagues in the past, I will in the future. It's the nature of trade-offs you face when
moving fast to test a business idea. The following things might help minimize that, though:

- agree to a single `.eslintrc` file and never deviate
- use a lot of small functions, and unit test them
- don't make a separate module without tests
- be as explicit and repeat yourself in tests
- be able to spin up a local dev environment with minimal commands,
or run against a presetup testing environment
