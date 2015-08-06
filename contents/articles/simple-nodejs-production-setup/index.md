---
title: The easiest guide to deploying and setting up Node.js in production
author: jeff
date: 2015-08-4 14:30
template: article.jade
---

### right from your terminal - without a third party service

```bash
./deploy www.example.com
```

There are a lot of articles about how to setup Node.js in production,
but they don't always cover the full thing in an automated, easily deployable
way. We will review how to setup a **one-line Node.js deploy** from your
local terminal (OSX or Linux), with very minimal code.

No fancy third party services deploy services here - just a little bash
and an upstart script.


## Deploying Node via simple shell script

The script below will:

- ensure Node.js is installed
- make an archive out of your code
- upload it via ssh to the server
- log to a file and rotate the logs regularly to prevent filling
up the disk
- setup auto-starting on server reboot
- setup auto-starting when the app crashes

You can reuse the script again and again to deploy your app.

While this isn't a silver bullet, it lets you host Node.js apps on an extremely
cheap VPS (virtual private server), if you like, without needing too much
knowledge of server admin. VPS hosting can be orders of magnitude cheaper
than cloud hosting - and faster. **You can host a simple Node.js website for
a dollar or two per month in many cases - extremely cheap.**


## Configuration (upstart .conf file) for Node.js app on Ubuntu 14.04

From inside your app directory:

```bash
touch myapp.conf # create it with your app name
chmod +x myapp.conf # make it executable
```

### myapp.conf

```bash
####
# Edit these to fit your app
####
author "@ruffrey"
env NAME=myapp
env APP_BIN=app.js
####
# End editables
####

description "$NAME"

env NODE_BIN=/usr/bin/node

# Max open files are @ 1024 by default
limit nofile 32768 32768

start on runlevel [23]
stop on shutdown
# Respawn in case of a crash, with default parameters
respawn

script
    APP_DIRECTORY="/opt/$NAME"
    LOG_FILE="/var/log/$NAME.log"
    touch $LOG_FILE
    cd $APP_DIRECTORY
    sudo $NODE_BIN $APP_DIRECTORY/$APP_BIN >> $LOG_FILE 2>&1
end script

post-start script
  echo "\n---------\napp $NAME post-start event from upstart script\n---------\n" >> $LOG_FILE
end script

```


## Deploy script for hosting on Ubuntu 14.04

From inside your app directory:

```bash
touch deploy # create it
chmod +x deploy # make it executable
```

### `deploy`

```bash
#! /bin/sh

# immediately abort if any of these commands fail
set -e

####
# The name of your app goes here and should match the .conf file
####
APPNAME=myapp

LOGIN=$USER@$1
LOG_FILE='/var/log/$APPNAME.log'
LOGROTATE_FILE='/etc/logrotate.d/$APPNAME'
LOGROTATE_CONFIG="'$LOG_FILE' {
    weekly
    rotate 12
    size 10M
    create
    su root jpx
    compress
    delaycompress
    postrotate
        service '$APPNAME' restart > /dev/null
    endscript
}
"

# Make sure all the pre-reqs are installed. if not, install them.
echo 'Checking that the server is setup.'
    echo '\n Build tools \n'
    ssh $LOGIN 'sudo apt-get update; sudo apt-get install -y build-essential'
    # install node
    echo '\n Node.js \n'
    ssh $LOGIN '/usr/bin/node --version || (curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -; sudo apt-get install -y nodejs)'
    # setup logrotate
    echo '\n log rotation\n'
        ssh $LOGIN "sudo rm -f '$LOGROTATE_FILE'"
        # needs to use tee because echo does not work with sudo
        ssh $LOGIN "echo '$LOGROTATE_CONFIG' | sudo tee --append '$LOGROTATE_FILE'"

echo '\n Ensuring all necessary paths exist on the server.\n'
    ssh $LOGIN " sudo mkdir -p /opt/$APPNAME; sudo chown '$USER' /opt/$APPNAME; \
        sudo mkdir -p /opt/$APPNAME-temp; sudo chown '$USER' /opt/$APPNAME-temp; \
        rm -f /opt/$APPNAME-temp/$APPNAME.tar.gz"


echo '\n Doing some housecleaning \n'
    ssh $LOGIN 'rm -f /opt/$APPNAME-temp/$APPNAME.tar.gz;'
    rm -f "$APPNAME.tar.gz"


echo '\n Making the artifact \n'
    tar czf $APPNAME.tar.gz --exclude='node_modules' *
    du -h $APPNAME.tar.gz


echo '\n Copying the artifact \n'
    scp $APPNAME.tar.gz $LOGIN:/opt/$APPNAME-temp

echo '\n Setting up the new artifact on the server \n'
    ssh $LOGIN "cd /opt/$APPNAME; \
        sudo rm -rf *; \
        cp -f '/opt/$APPNAME-temp/$APPNAME.tar.gz' '/opt/$APPNAME'; \
        tar xzf '$APPNAME.tar.gz'; \
        sudo cp -f '$APPNAME.conf' /etc/init;"

echo '\n npm install\n'
    ssh $LOGIN "cd '/opt/$APPNAME'; sudo service '$APPNAME' stop; sudo /usr/bin/npm install --production;"

echo '\n Starting the app\n'
    ssh $LOGIN "sudo service '$APPNAME' restart"

echo 'Done.'
exit 0;

```

## Deploy script usage

```bash
./deploy 255.255.255.255
# or
./deploy www.example.com
```

where the argument is the hostname or IP to deploy it to.


## Troubleshooting

Check the upstart logs:

```bash
sudo tail /var/log/upstart/myapp.log
```

If those look ok, check your server logs

```bash
tail /var/log/myapp.log
```

## Don't stay with sudo

You should not run your app with `sudo` permanently (see the upstart
`myapp.conf` script).

After starting up the app (and listening on a port, if you do that):

```javascript
process.setgid('users');
process.setuid('someuser');
```
